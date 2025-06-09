import { Socket } from "socket.io-client";
interface TombalaBoardProps {
    socket: Socket | null;
    lobbyId: string;
    username: string | null;
    gameState: any;
}
export declare function TombalaBoard({ socket, lobbyId, username, gameState }: TombalaBoardProps): import("react/jsx-runtime").JSX.Element;
export {};
