
interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    request: (request: { method: string; params?: Array<any> }) => Promise<any>;
    on: (eventName: string, callback: any) => void;
    removeListener: (eventName: string, callback: any) => void;
  };
}
