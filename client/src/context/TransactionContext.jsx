import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

import { contractABI, contractAddress } from '../utils/constants';

export const TransactionContext = React.createContext();

const { ethereum } = window;

const getEthereumContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const transactionContract = new ethers.Contract(contractAddress, contractABI, signer);

    return transactionContract;
}

export const TransactionProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'));
    const [currentAccount, setCurrentAccount] = useState("");
    const [formData, setFormData] = useState({ addressTo: '', amount: '', keyword: '', message: '' });

    const handleChange = (e, name) => {
        setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
    }

    const getAllTransactions = async () => {
        try {
            if (!ethereum) return alert('Please install MetaMask');

            const availableTransactions = await getEthereumContract().getallTransactions();

            const structuredTransactions = availableTransactions.map((transaction) => {
                const { receiver, sender, amount, keyword, message, timestamp } = transaction;
                return {
                    addressTo: receiver,
                    addressFrom: sender,
                    timestamp: new Date(timestamp * 1000).toLocaleString(),
                    message,
                    keyword,
                    amount: parseInt(amount._hex) / (10 ** 18)
                };
            });
            console.log(structuredTransactions);
            setTransactions(structuredTransactions);
        } catch (error) {
            console.log(error)
        }
    }

    const checkIfWalletIsConnected = async () => {
        try {
            if (!ethereum) return alert('Please install MetaMask');
            const accounts = await ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                setCurrentAccount(accounts[0]);

                getAllTransactions()
            } else {
                alert('No accounts found');
            }
            console.log(accounts);
        } catch (error) {
            console.log(error)
            throw new Error("No Ethereum object found");
        }
    }

    const checkifTransactionsExist = async () => {
        try {
            const transactionContract = getEthereumContract();
            const transactionCount = await transactionContract.addTransactionCount();

            window.localStorage.setItem('transactionCount', transactionCount)
        } catch (error) {
            console.log(error);
            throw new Error("No Ethereum object found");
        }
    }

    const connectWallet = async () => {
        try {
            if (!ethereum) return alert('Please install MetaMask');
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            setCurrentAccount(accounts[0]);
        } catch (error) {
            console.log(error);
            throw new Error("No Ethereum object found");
        }
    }

    const sendTransaction = async () => {
        try {
            console.log("clicked!!!!!!")
            if (!ethereum) return alert('Please install MetaMask');

            const { addressTo, amount, keyword, message } = formData;
            const transactionContract = getEthereumContract();
            const parsedAmount = ethers.utils.parseEther(amount)

            await ethereum.request({
                method: 'eth_sendTransaction',
                params: [{
                    from: currentAccount,
                    to: addressTo,
                    gas: '0x5208', // 21000 GWEI
                    value: parsedAmount._hex, // 0.00001
                }]
            });

            const transactionHash = await transactionContract.addToBlockchain(addressTo, parsedAmount, message, keyword);

            setIsLoading(true);
            console.log(`Loading - ${transactionHash.hash}`);
            await transactionHash.wait();
            setIsLoading(false);
            console.log(`Success - ${transactionHash.hash}`);

            const transactionCount = await transactionContract.addTransactionCount();
            setTransactionCount(transactionCount.toNumber());

            window.location.reload();
        } catch (error) {
            console.log(error);
            throw new Error("No Ethereum object found");
        }
    }

    useEffect(() => {
        checkIfWalletIsConnected();
        checkifTransactionsExist();
    }, [])

    return (
        <TransactionContext.Provider value={{ connectWallet, currentAccount, formData, sendTransaction, handleChange, transactions, isLoading }}>
            {children}
        </TransactionContext.Provider>
    )
}