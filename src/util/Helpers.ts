
export const getClientIp = (req: any) => {
    return req.ip.replace("::ffff:", "");
};
