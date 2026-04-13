import '@styles/ViewAllTransactions.css';
import { useState, useEffect } from 'react';
import { fetchTransactions } from '@/services/api';

type Transaction = {
    id: string;
    productName: string;
    priceAtSaleCents: number;
    dateSold: string;
}

const ViewAllTransactions = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const itemsPerPage = 15;

    const loadTransactions = async () => {
        try{
            const data = await fetchTransactions(itemsPerPage, 0);
            setTransactions(data);

        } catch (error) {
            console.error('Failed to load transactions', error);
        }
    }

    useEffect(() => {
        loadTransactions();
    }, []);
    
    return (
        <div className="default-container view-all-transactions-container">
            <div className="view-all-transactions-header">
                <h2>Transactions</h2>
                <p className="view-all-transactions-subtitle">
                    View and manage all transactions
                </p>
            </div>

            
        </div>
    );
};

export default ViewAllTransactions;
