import React, { useRef, useEffect, useState, useCallback } from "react";
import styles from "./CanvasArea.module.less";
import hotkeys from "hotkeys-js";


const CanvasArea: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const areaRef = useRef<HTMLDivElement>(null);
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
    const [dragActive, setDragActive] = useState(false);
    const [webgpuSupported, setWebgpuSupported] = useState<boolean | null>(null);
    const [scale, setScale] = useState(1);

    // 画布尺寸始终与图片一致
    useEffect(() => {
        if (image) {
            setCanvasSize({ width: image.width, height: image.height });
        } else {
            setCanvasSize({ width: 0, height: 0 });
        }
    }, [image]);

    // 图片导入后自动适配缩放
    useEffect(() => {
        if (image && areaRef.current) {
            const areaRect = areaRef.current.getBoundingClientRect();
            const fitScale = Math.min(
                areaRect.width / image.width,
                areaRect.height / image.height,
                1
            );
            setScale(Math.round(fitScale * 100) / 100);
        }
    }, [image]);

    // Alt+滚轮缩放
    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            if (e.altKey && (image && canvasSize.width > 0 && canvasSize.height > 0)) {
                e.preventDefault();
                setScale((prev) => {
                    let next = prev - e.deltaY * 0.0002;
                    next = Math.max(0.1, Math.min(8, next));
                    return Math.round(next * 100) / 100;
                });
            }
        };
        window.addEventListener("wheel", handleWheel, { passive: false });
        return () => window.removeEventListener("wheel", handleWheel);
    }, [image, canvasSize]);

    // WebGPU 渲染
    useEffect(() => {
        let device: any = null;
        let context: any = null;
        let texture: any = null;
        let animationFrameId: number;

        async function initWebGPU(img: HTMLImageElement) {
            if (!canvasRef.current) return;
            if (!navigator.gpu) {
                setWebgpuSupported(false);
                return;
            }
            setWebgpuSupported(true);
            const adapter = await navigator.gpu.requestAdapter();
            if (!adapter) return;
            device = await adapter.requestDevice();
            context = canvasRef.current.getContext("webgpu") as any;
            if (!context) return;

            const format = navigator.gpu.getPreferredCanvasFormat();
            context.configure({
                device,
                format,
                alphaMode: "premultiplied",
            });

            // 创建图片纹理
            const usage = (window.GPUTextureUsage?.TEXTURE_BINDING || 0x08) |
                (window.GPUTextureUsage?.COPY_DST || 0x20) |
                (window.GPUTextureUsage?.RENDER_ATTACHMENT || 0x10);
            texture = device.createTexture({
                size: [img.width, img.height, 1],
                format: "rgba8unorm",
                usage,
            });

            // 将图片数据上传到纹理
            const imageBitmap = await createImageBitmap(img);
            device.queue.copyExternalImageToTexture(
                { source: imageBitmap },
                { texture: texture },
                [img.width, img.height]
            );

            // 创建采样器
            const sampler = device.createSampler({
                magFilter: "linear",
                minFilter: "linear",
            });

            // 创建着色器
            const shaderModule = device.createShaderModule({
                code: `
                @group(0) @binding(0) var mySampler: sampler;
                @group(0) @binding(1) var myTexture: texture_2d<f32>;
                struct VertexOutput {
                  @builtin(position) position: vec4<f32>,
                  @location(0) fragUV: vec2<f32>,
                };
                @vertex
                fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
                  var pos = array<vec2<f32>, 6>(
                    vec2<f32>(-1.0, -1.0),
                    vec2<f32>(1.0, -1.0),
                    vec2<f32>(-1.0, 1.0),
                    vec2<f32>(-1.0, 1.0),
                    vec2<f32>(1.0, -1.0),
                    vec2<f32>(1.0, 1.0)
                  );
                  var uv = array<vec2<f32>, 6>(
                    vec2<f32>(0.0, 1.0),
                    vec2<f32>(1.0, 1.0),
                    vec2<f32>(0.0, 0.0),
                    vec2<f32>(0.0, 0.0),
                    vec2<f32>(1.0, 1.0),
                    vec2<f32>(1.0, 0.0)
                  );
                  var output: VertexOutput;
                  output.position = vec4<f32>(pos[vertexIndex], 0.0, 1.0);
                  output.fragUV = uv[vertexIndex];
                  return output;
                }
                @fragment
                fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
                  return textureSample(myTexture, mySampler, input.fragUV);
                }
                `,
            });

            // 创建渲染管线
            const pipeline = device.createRenderPipeline({
                layout: "auto",
                vertex: {
                    module: shaderModule,
                    entryPoint: "vs_main",
                },
                fragment: {
                    module: shaderModule,
                    entryPoint: "fs_main",
                    targets: [{ format }],
                },
                primitive: { topology: "triangle-list" },
            });

            // 创建 bind group
            const bindGroup = device.createBindGroup({
                layout: pipeline.getBindGroupLayout(0),
                entries: [
                    { binding: 0, resource: sampler },
                    { binding: 1, resource: texture.createView() },
                ],
            });

            // 渲染函数
            function render() {
                if (!context) return;
                const encoder = device.createCommandEncoder();
                const view = context.getCurrentTexture().createView();
                const renderPass = encoder.beginRenderPass({
                    colorAttachments: [
                        {
                            view,
                            clearValue: { r: 0.13, g: 0.13, b: 0.13, a: 1 },
                            loadOp: "clear",
                            storeOp: "store",
                        },
                    ],
                });
                renderPass.setPipeline(pipeline);
                renderPass.setBindGroup(0, bindGroup);
                renderPass.draw(6, 1, 0, 0);
                renderPass.end();
                device.queue.submit([encoder.finish()]);
                animationFrameId = requestAnimationFrame(render);
            }

            render();
        }

        initWebGPU(image);

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [webgpuSupported, image, canvasSize]);

    const handleFile = useCallback((file: File) => {
        const img = new Image();
        img.onload = () => setImage(img);
        img.src = URL.createObjectURL(file);
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    // 拖拽相关
    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragActive(true);
    };
    const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragActive(false);
    };
    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith("image/")) {
            handleFile(file);
        }
    };

    return (
        <div
            ref={areaRef}
            className={styles.canvasArea}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            {!webgpuSupported && (
                <div className={styles.webgpuTip}>
                    当前浏览器不支持 WebGPU，无法显示图片。
                </div>
            )}
            {image && canvasSize.width > 0 && canvasSize.height > 0 && (
                <div
                    className={styles.canvasWrapper}
                    style={{ width: canvasSize.width, height: canvasSize.height }}
                >
                    <canvas
                        ref={canvasRef}
                        width={canvasSize.width}
                        height={canvasSize.height}
                        className={styles.canvas}
                        style={{ transform: `scale(${scale})` }}
                    />
                </div>
            )}
            <div style={{ position: "absolute", top: 24, left: 24 }}>
                <label className={styles.uploadBtn}>
                    导入图片
                    <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                    />
                </label>
            </div>
            {dragActive && (
                <div className={styles.dragOverlay}>
                    拖拽图片到此处导入
                </div>
            )}
        </div>
    );
};

export default CanvasArea;
