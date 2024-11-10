// credits to https://github.com/AgoraIO-Extensions/agora-rtc-react/issues/181#issuecomment-1886586029

"use client";

import { useState, useEffect, ReactNode, useRef } from "react";
import type { ClientConfig, IAgoraRTCClient } from "agora-rtc-react";
import dynamic from "next/dynamic";

const AgoraRTCProviderPrimitive = dynamic(
    () =>
        import("agora-rtc-react").then(({ AgoraRTCProvider }) => AgoraRTCProvider),
    {
        ssr: false,
    },
);

export default function AgoraRTCProvider(props: {
    clientConfig: ClientConfig;
    children: ReactNode;
}) {
    const clientConfigRef = useRef<ClientConfig>(props.clientConfig);
    const [client, setClient] = useState<IAgoraRTCClient>();

    useEffect(() => {
        const initSdk = async () => {
            const AgoraRTC = (await import("agora-rtc-react")).default;
            setClient(AgoraRTC.createClient(clientConfigRef.current));
        };
        initSdk();
    }, []);

    return (
        client && (
            <AgoraRTCProviderPrimitive client={client}>
                {props.children}
            </AgoraRTCProviderPrimitive>
        )
    );
}