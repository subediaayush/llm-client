import { IMessageType } from "../App";

export const useAI = (model: string, onResponse: (data: any, type?: IMessageType, err?: any) => void) => {
    const setPrompt = async (prompt: File | string, type: IMessageType, output: IMessageType) => {
        const formData = new FormData();
        formData.append("model", model)
        var accept = "*/*";
        switch (type) {
            case IMessageType.IMAGE:
                formData.append("image", prompt);
                break;
            case IMessageType.AUDIO:
                formData.append("audio", prompt);
                break;
            case IMessageType.TEXT:
                formData.append("text", prompt);
                break;
        }

        switch (output) {
            case IMessageType.IMAGE:
                accept = "image/png";
                break;
            case IMessageType.AUDIO:
                accept = "image/wav";
                break;
            case IMessageType.TEXT:
                accept = "text/plain";
                break;
        }

        const headers = new Headers();
        headers.append('Accept', accept)

        console.log('Sending', formData, headers)

        try {
            const data = await fetch('http://localhost:2475/query', { method: 'POST', body: formData, headers: headers })
            onResponse(await data.text(), output)
        } catch (e) {
            onResponse(undefined, undefined, e)
        }
    }

    return setPrompt
}