import React, { useRef, useEffect, useState, useCallback } from "react";
import styles from "./CanvasArea.module.less";
import hotkeys from "hotkeys-js";
import { useGlobalStore } from "../store/globalStore";

const CanvasArea: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const areaRef = useRef<HTMLDivElement>(null);
    const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
    const [dragActive, setDragActive] = useState(false);
    const [webgpuSupported, setWebgpuSupported] = useState<boolean | null>(true);
    const [scale, setScale] = useState(1);
    const [webgpuReady, setWebgpuReady] = useState(false);
    const [showBeforeAfter, setShowBeforeAfter] = useState(false);

    // 全局图片状态
    const image = useGlobalStore(state => state.image);
    const setImage = useGlobalStore(state => state.setImage);

    // WebGPU refs
    const deviceRef = useRef<any>(null);
    const contextRef = useRef<any>(null);
    const pipelineRef = useRef<any>(null);
    const samplerRef = useRef<any>(null);
    const shaderModuleRef = useRef<any>(null);
    const bindGroupRef = useRef<any>(null);
    const textureRef = useRef<any>(null);
    const animationFrameIdRef = useRef<number>(0);
    const formatRef = useRef<any>(null);

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

    // WebGPU 初始化（只做一次）
    useEffect(() => {
        async function initWebGPU() {
            if (!canvasRef.current) return;
            if (!navigator.gpu) {
                setWebgpuSupported(false);
                return;
            }
            setWebgpuSupported(true);
            const adapter = await navigator.gpu.requestAdapter();
            if (!adapter) return;
            const device = await adapter.requestDevice();
            const context = canvasRef.current.getContext("webgpu");
            if (!context) return;
            const format = navigator.gpu.getPreferredCanvasFormat();
            context.configure({
                device,
                format,
                alphaMode: "premultiplied",
            });
            // 着色器
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
            // 管线
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
            // 采样器
            const sampler = device.createSampler({
                magFilter: "nearest",
                minFilter: "nearest",
            });
            // 保存引用
            deviceRef.current = device;
            contextRef.current = context;
            pipelineRef.current = pipeline;
            samplerRef.current = sampler;
            shaderModuleRef.current = shaderModule;
            formatRef.current = format;
            setWebgpuReady(true);
        }

        initWebGPU();
        return () => {
            if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
        };
    }, []);

    // 图片变化或WebGPU初始化完成时只更新纹理和bindGroup
    useEffect(() => {
        async function updateTexture() {
            if (!image || !deviceRef.current || !pipelineRef.current) return;
            const device = deviceRef.current;
            const usage = (window.GPUTextureUsage?.TEXTURE_BINDING || 0x08) |
                (window.GPUTextureUsage?.COPY_DST || 0x20) |
                (window.GPUTextureUsage?.RENDER_ATTACHMENT || 0x10);
            // 释放旧纹理
            if (textureRef.current) {
                textureRef.current.destroy?.();
            }
            // 创建新纹理
            const texture = device.createTexture({
                size: [image.width, image.height, 1],
                format: "rgba8unorm",
                usage,
            });
            const imageBitmap = await createImageBitmap(image);
            device.queue.copyExternalImageToTexture(
                { source: imageBitmap },
                { texture: texture },
                [image.width, image.height]
            );
            textureRef.current = texture;
            // 创建新的bindGroup
            const bindGroup = device.createBindGroup({
                layout: pipelineRef.current.getBindGroupLayout(0),
                entries: [
                    { binding: 0, resource: samplerRef.current },
                    { binding: 1, resource: texture.createView() },
                ],
            });
            bindGroupRef.current = bindGroup;
        }

        updateTexture();
    }, [image, webgpuReady]);

    // canvas尺寸变化时，更新canvas属性
    useEffect(() => {
        if (canvasRef.current && canvasSize.width && canvasSize.height) {
            canvasRef.current.width = canvasSize.width;
            canvasRef.current.height = canvasSize.height;
            // 关键：canvas尺寸变化时，重新configure context
            if (contextRef.current && deviceRef.current && formatRef.current) {
                contextRef.current.configure({
                    device: deviceRef.current,
                    format: formatRef.current,
                    alphaMode: "premultiplied",
                });
            }
        }
    }, [canvasSize]);

    // 渲染循环
    useEffect(() => {
        function render() {
            const device = deviceRef.current;
            const context = contextRef.current;
            const pipeline = pipelineRef.current;
            const bindGroup = bindGroupRef.current;
            if (!device || !context || !pipeline || !bindGroup) {
                animationFrameIdRef.current = requestAnimationFrame(render);
                return;
            }
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
            animationFrameIdRef.current = requestAnimationFrame(render);
        }

        animationFrameIdRef.current = requestAnimationFrame(render);
        return () => {
            if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
        };
    }, [image, canvasSize]);

    const handleFile = useCallback((file: File) => {
        const img = new Image();
        img.onload = () => setImage(img);
        img.src = URL.createObjectURL(file);
    }, [setImage]);

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

    return <div
        ref={areaRef}
        className={styles.canvasArea}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
    >
        {webgpuSupported === false && <div className={styles.webgpuTip}>
            当前浏览器不支持 WebGPU，无法显示图片。
        </div>}
        {!image && webgpuSupported === true && <div className={styles.emptyTip}>
            请将图片拖拽到此处
        </div>}
        <div
            className={styles.canvasWrapper}
            style={{ width: canvasSize.width, height: canvasSize.height }}
        >
            <canvas
                ref={canvasRef}
                className={styles.canvas}
                style={{ transform: `scale(${scale})`, display: image && canvasSize.width && canvasSize.height ? "block" : "none" }}
            />
        </div>
        {/* 前后对比视图 */}
        {showBeforeAfter && image && <div className={styles.beforeAfter}>
            <div className={styles.beforeAfterTitle}>前后对比</div>
            <div className={styles.beforeAfterContainer}>
                <div className={styles.beforeImage}>
                    <div className={styles.beforeLabel}>调整前</div>
                    <div className={styles.imagePlaceholder}>原图</div>
                </div>
                <div className={styles.afterImage}>
                    <div className={styles.afterLabel}>调整后</div>
                    <div className={styles.imagePlaceholder}>调整后</div>
                </div>
            </div>
        </div>}
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
        {dragActive && <div className={styles.dragOverlay}>
            拖拽图片到此处导入
        </div>}
    </div>;
};

export default CanvasArea;
