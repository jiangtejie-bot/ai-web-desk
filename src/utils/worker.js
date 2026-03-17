import { pipeline } from '@xenova/transformers';

let transcriber = null;

self.onmessage = async (e) => {
    const { audio } = e.data;

    // 1. 初始化模型（仅在第一次调用时加载）
    if (!transcriber) {
        transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en', {
            device: 'webgpu', // 如果用户显卡支持 WebGPU，速度提升 10 倍
        });
    }

    // 2. 运行推理
    const output = await transcriber(audio, {
        chunk_length_s: 30,
        stride_length_s: 5,
        callback_function: (item) => {
            self.postMessage({ status: 'partial', data: item });
        }
    });

    self.postMessage({ status: 'complete', data: output });
};