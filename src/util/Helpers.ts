
export const getClientIp = (req: any) => req.ip.replace("::ffff:", "");
