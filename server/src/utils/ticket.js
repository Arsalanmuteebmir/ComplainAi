export function makeTicket(){return `CMP-${new Date().getFullYear()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;}
