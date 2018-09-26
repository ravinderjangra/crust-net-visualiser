interface TimeSpent {
    secs: number;
    nanos: number;
}

interface Success {
    Succeeded: TimeSpent;
}

interface NatTraversal {
    result: boolean;
    timeSpent: TimeSpent;
}

interface Peer {
    ip: string;
    nat_type: string;
    os: string;
}

interface ConnectionLog {
    peer_requester: Peer;
    peer_responder: Peer;
    is_direct_successful: boolean;
    utp_hole_punch_result: string | TimeSpent;
    tcp_hole_punch_result: string | TimeSpent;
}

interface User {
    userId: number;
    userName: string;
    email: string;
    trustLevel: number;
    strategy: string;
    ip: string;
}

export { TimeSpent, Success, NatTraversal, Peer, ConnectionLog, User };