//function to shorten ethereum address
export const shortenAddress = (address) => {
    if (address.length > 7) {
        return `${address.slice(0, 7)}...${address.slice(address.length - 4)}`;
    }
    return address;
}