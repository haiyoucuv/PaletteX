export interface HistogramData {
    red: number[];
    green: number[];
    blue: number[];
    luminance: number[];
}

export interface HistogramCalculator {
    calculateHistogram(image: HTMLImageElement): Promise<HistogramData>;
}

// Canvas2D实现
export class Canvas2DHistogramCalculator implements HistogramCalculator {
    async calculateHistogram(img: HTMLImageElement): Promise<HistogramData> {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('无法创建2D上下文');

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        const red = new Array(256).fill(0);
        const green = new Array(256).fill(0);
        const blue = new Array(256).fill(0);
        const luminance = new Array(256).fill(0);

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            red[r]++;
            green[g]++;
            blue[b]++;

            const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
            luminance[lum]++;
        }

        return { red, green, blue, luminance };
    }
}

// WebGPU实现
export class WebGPUHistogramCalculator implements HistogramCalculator {
    private device: GPUDevice | null = null;
    private computePipeline: GPUComputePipeline | null = null;

    constructor(device: GPUDevice) {
        this.device = device;
        this.initComputePipeline();
    }

    private initComputePipeline() {
        if (!this.device) return;

        const histogramShader = this.device.createShaderModule({
            code: `
                struct HistogramBuffer {
                    red: array<atomic<u32>, 256>,
                    green: array<atomic<u32>, 256>,
                    blue: array<atomic<u32>, 256>,
                    luminance: array<atomic<u32>, 256>,
                }

                @group(0) @binding(0) var inputTexture: texture_2d<f32>;
                @group(0) @binding(1) var<storage, read_write> histogramBuffer: HistogramBuffer;

                @compute @workgroup_size(16, 16)
                fn histogramCompute(@builtin(global_invocation_id) global_id: vec3<u32>) {
                    let pixelCoord = vec2<i32>(global_id.xy);
                    let textureSize = textureDimensions(inputTexture);
                    
                    if (pixelCoord.x >= i32(textureSize.x) || pixelCoord.y >= i32(textureSize.y)) {
                        return;
                    }
                    
                    let pixelColor = textureLoad(inputTexture, pixelCoord, 0);
                    let r = u32(pixelColor.r * 255.0);
                    let g = u32(pixelColor.g * 255.0);
                    let b = u32(pixelColor.b * 255.0);
                    let lum = u32((0.299 * pixelColor.r + 0.587 * pixelColor.g + 0.114 * pixelColor.b) * 255.0);
                    
                    atomicAdd(&histogramBuffer.red[r], 1u);
                    atomicAdd(&histogramBuffer.green[g], 1u);
                    atomicAdd(&histogramBuffer.blue[b], 1u);
                    atomicAdd(&histogramBuffer.luminance[lum], 1u);
                }
            `
        });

        this.computePipeline = this.device.createComputePipeline({
            layout: 'auto',
            compute: {
                module: histogramShader,
                entryPoint: 'histogramCompute'
            }
        });
    }

    async calculateHistogram(img: HTMLImageElement): Promise<HistogramData> {
        if (!this.device || !this.computePipeline) {
            throw new Error('WebGPU设备或计算管线未初始化');
        }

        // 创建输入纹理
        const inputTexture = this.device.createTexture({
            size: [img.width, img.height, 1],
            format: 'rgba8unorm',
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
        });

        // 将图像数据复制到纹理
        const imageBitmap = await createImageBitmap(img);
        this.device.queue.copyExternalImageToTexture(
            { source: imageBitmap },
            { texture: inputTexture },
            [img.width, img.height]
        );

        // 创建直方图缓冲区
        const histogramBufferSize = 256 * 4 * 4; // 4个通道 * 256个值 * 4字节
        const histogramBuffer = this.device.createBuffer({
            size: histogramBufferSize,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
            mappedAtCreation: false
        });

        // 创建绑定组
        const bindGroup = this.device.createBindGroup({
            layout: this.computePipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: inputTexture.createView() },
                { binding: 1, resource: histogramBuffer }
            ]
        });

        // 创建命令编码器并执行计算
        const encoder = this.device.createCommandEncoder();
        const computePass = encoder.beginComputePass();
        computePass.setPipeline(this.computePipeline);
        computePass.setBindGroup(0, bindGroup);
        computePass.dispatchWorkgroups(Math.ceil(img.width / 16), Math.ceil(img.height / 16));
        computePass.end();

        // 创建读取缓冲区
        const readBuffer = this.device.createBuffer({
            size: histogramBufferSize,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
        });

        encoder.copyBufferToBuffer(histogramBuffer, 0, readBuffer, 0, histogramBufferSize);
        this.device.queue.submit([encoder.finish()]);

        // 读取结果
        await readBuffer.mapAsync(GPUMapMode.READ);
        const histogramData = new Uint32Array(readBuffer.getMappedRange());

        // 转换为数组格式
        const red = Array.from(histogramData.slice(0, 256));
        const green = Array.from(histogramData.slice(256, 512));
        const blue = Array.from(histogramData.slice(512, 768));
        const luminance = Array.from(histogramData.slice(768, 1024));

        readBuffer.unmap();

        return { red, green, blue, luminance };
    }
}

// 工厂函数：根据WebGPU支持情况创建合适的计算器
export function createHistogramCalculator(device?: GPUDevice): HistogramCalculator {
    if (device && navigator.gpu) {
        return new WebGPUHistogramCalculator(device);
    } else {
        return new Canvas2DHistogramCalculator();
    }
}

// 便捷函数：直接计算直方图
export async function calculateHistogram(image: HTMLImageElement, device?: GPUDevice): Promise<HistogramData> {
    const calculator = createHistogramCalculator(device);
    return await calculator.calculateHistogram(image);
}
