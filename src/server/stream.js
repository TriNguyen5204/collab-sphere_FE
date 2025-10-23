import { useSelector } from "react-redux";

const apiKey = import.meta.env.STREAM_API_KEY;
const apiSecret = import.meta.env.STREAM_SECRET_KEY;

export const tokenProvider = async () => {
    const user = useSelector((state)=> state.user)

    const streamClient = new stream
}

 