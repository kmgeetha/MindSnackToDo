// src/hooks/useNetwork.js
import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

export const useNetwork = () => {
    const [isConnected, setIsConnected] = useState(true);
    useEffect(() => {
        const unsub = NetInfo.addEventListener(state => {
            setIsConnected(Boolean(state.isConnected));
        });
        NetInfo.fetch().then(state => setIsConnected(Boolean(state.isConnected)));
        return unsub;
    }, []);
    return isConnected;
};
