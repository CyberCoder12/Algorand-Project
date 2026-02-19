"use client";

import { useWallet } from "@txnlab/use-wallet-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Loader2, Wallet, LogOut, Copy } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export function WalletConnect() {
    const {
        wallets,
        activeAccount,
        activeWallet,
        isReady
    } = useWallet();

    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleConnect = (walletId: string) => {
        const wallet = wallets?.find(w => w.id === walletId);
        if (wallet) {
            wallet.connect();
        }
    };

    const handleDisconnect = () => {
        if (activeWallet) {
            activeWallet.disconnect();
        }
    };

    const copyAddress = () => {
        if (activeAccount) {
            navigator.clipboard.writeText(activeAccount.address);
            toast.success("Address copied to clipboard");
        }
    };

    if (!isClient) {
        return null;
    }

    if (!isReady) {
        return (
            <Button variant="outline" disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
            </Button>
        );
    }

    if (activeAccount) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="font-mono">
                        <Wallet className="mr-2 h-4 w-4" />
                        {activeAccount.address.slice(0, 6)}...{activeAccount.address.slice(-4)}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Wallet Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Address
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDisconnect} className="text-red-500 cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        Disconnect
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button>Connect Wallet</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Select Wallet</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {wallets?.map(wallet => (
                    <DropdownMenuItem
                        key={wallet.id}
                        onClick={() => handleConnect(wallet.id)}
                        className="cursor-pointer"
                    >
                        <img
                            src={wallet.metadata.icon}
                            alt={wallet.metadata.name}
                            className="mr-2 h-5 w-5 object-contain"
                        />
                        {wallet.metadata.name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
