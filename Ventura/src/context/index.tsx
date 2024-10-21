"use client";
import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import {
  getContract,
  prepareContractCall,
  sendTransaction,
  waitForReceipt,
  readContract,
  toWei,
} from "thirdweb";
import { defineChain } from "thirdweb";
import { createWallet } from "thirdweb/wallets";
import { ethers } from "ethers";
import { client } from "../app/client";
import { formatEther } from "ethers";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { useToast } from "@/hooks/use-toast";

const chain = defineChain(1320);

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("io.rabby"),
  createWallet("io.zerion.wallet"),
];

export function ConnectIt() {
  return (
    <ConnectButton
      client={client}
      wallets={wallets}
      theme={"dark"}
      connectModal={{
        size: "wide",
        title: "Connect to Ventura",
        showThirdwebBranding: false,
      }}
      chain={chain}
      connectButton={{
        label: "Connect Wallet",
      }}
    />
  );
}

interface StateContextType {
  address: string;
  contract: any;
  account: any;
  createStartupCampaign: (
    title: string,
    description: string,
    target: string,
    deadline: number,
    image: string,
    video: string,
    equityHolders: { name: string; percentage: bigint }[]
  ) => Promise<any>;
  applyForLoan: (
    amount: string,
    purpose: string,
    name: string,
    duration: number
  ) => Promise<any>;
  lendLoan: (lId: number, amount: string) => Promise<any>;
  getCampaigns: () => Promise<any[]>;
  getLoanRequests: () => Promise<any[]>;
  withdrawStartupFunds: (pId: number) => Promise<any>;
  fundStartup: (pId: number, amount: string) => Promise<any>;
  withdrawLoanFunds: (lId: number) => Promise<any>;
  repayLoan: (lId: number, amount: string) => Promise<any>;
}

const StateContext = createContext<StateContextType | undefined>(undefined);

export const StateContextProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const activeAccount = useActiveAccount();
  const [address, setAddress] = useState<string>("");
  const [contract, setContract] = useState<any>(null);
  const [account, setAccount] = useState<any>(null);

  useEffect(() => {
    if (activeAccount) {
      setAccount(activeAccount);
      setAddress(activeAccount.address);
    }
  }, [activeAccount]);
  useEffect(() => {
    async function contractInit() {
      if (account) {
        const contract = await getContract({
          client,
          chain: chain,
          address: "0x628991DEdBBd26D6B85F1D11599d3C228209979e",
        });
        setContract(contract);
      }
    }
    contractInit();
  }, [account]);

  const createStartupCampaign = async (
    title: string,
    description: string,
    target: string,
    deadline: number,
    image: string,
    video: string,
    equityHolders: { name: string; percentage: bigint }[]
  ) => {
    console.log("Creating startup campaign with:", {
      title,
      description,
      target,
      deadline,
      image,
      video,
      equityHolders,
    });

    const preparedTx = await prepareContractCall({
      contract,
      method:
        "function createStartup(address _owner, string _title, string _description, (string name, uint256 percentage)[] _equityHolders, string _pitchVideo, string _image, string _documents, uint256 _target, uint256 _deadline) returns (uint256)",
      params: [
        address,
        title,
        description,
        equityHolders,
        video,
        image,
        "",
        toWei(target),
        BigInt(deadline),
      ],
    });

    try {
      console.log("Creating startup campaign", preparedTx);
      const tx = await sendTransaction({
        transaction: preparedTx,
        account: account,
      });
      const receipt = await waitForReceipt({
        client,
        chain,
        transactionHash: tx.transactionHash,
      });
      console.log("Contract call success", receipt);
      return receipt.transactionHash;
    } catch (error) {
      console.error("Contract call failure", error);
    }
  };

  const applyForLoan = async (
    amount: string,
    purpose: string,
    name: string,
    duration: number
  ) => {
    console.log("Applying for loan with:", {
      amount,
      purpose,
      name,
      duration,
    });

    const preparedTx = prepareContractCall({
      contract,
      method:
        "function requestLoan(address _requester, string _name, string _purpose, uint256 _amount, uint256 _duration) returns (uint256)",
      params: [
        address,
        name,
        purpose,
        ethers.parseEther(amount),
        BigInt(duration),
      ],
    });

    try {
      console.log("Applying for loan", preparedTx);
      const tx = await sendTransaction({
        transaction: preparedTx,
        account: account,
      });
      const receipt = await waitForReceipt({
        client,
        chain,
        transactionHash: tx.transactionHash,
      });
      console.log("Loan application successful", receipt);
      return receipt.transactionHash;
    } catch (error) {
      console.error("Loan application failed", error);
    }
  };

  async function getCampaigns() {
    try {
      const campaigns = await readContract({
        contract,
        method:
          "function getStartups() view returns ((address owner, string title, string description, (string name, uint256 percentage)[] equityHolders, string pitchVideo, string image, string documents, uint256 target, uint256 deadline, uint256 amountCollected, (address funderAddress, uint256 amount)[] funders)[])",
        params: [],
      });

      // Map the returned campaigns to your desired format
      return campaigns.map((campaign: any, i: number) => ({
        owner: campaign.owner,
        title: campaign.title,
        description: campaign.description,
        target: formatEther(campaign.target.toString()), // Convert to Ether
        deadline: new Date(Number(campaign.deadline)), // Convert to Date
        amountCollected: formatEther(campaign.amountCollected.toString()), // Convert to Ether
        image: campaign.image,
        video: campaign.pitchVideo,
        donations: campaign.donations
          ? campaign.donations.map((donation: any) => ({
              funderAddress: donation.funderAddress,
              amount: formatEther(donation.amount.toString()), // Convert to Ether
            }))
          : [],
        pId: i,
      }));
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      return [];
    }
  }

  async function getLoanRequests() {
    try {
      const loans = await readContract({
        contract,
        method:
          "function getLoanRequests() view returns ((address requester, string name, string purpose, uint256 amount, uint256 duration, uint256 amountCollected, (address funderAddress, uint256 amount)[] lenders, bool repaid)[])",
        params: [],
      });
      return loans.map((loan: any, i: number) => ({
        requester: loan.requester,
        name: loan.name,
        purpose: loan.purpose,
        amount: formatEther(loan.amount.toString()),
        duration: loan.duration,
        amountCollected: formatEther(loan.amountCollected.toString()),
        repaid: loan.repaid,
        lenders: loan.lenders
          ? loan.lenders.map((lender: any) => ({
              address: lender.funderAddress,
              amount: formatEther(lender.amount.toString()),
            }))
          : [],
        lId: i,
      }));
    } catch (error) {
      console.error("Error fetching loan requests:", error);
      return [];
    }
  }

  async function lendLoan(lId: number, amount: string) {
    const preparedTx = prepareContractCall({
      contract,
      method: "function fundLoan(uint256 _id) payable",
      params: [BigInt(lId)],
      value: BigInt(toWei(amount)),
    });

    try {
      const tx = await sendTransaction({
        transaction: preparedTx,
        account: account,
      });
      const receipt = await waitForReceipt({
        client,
        chain,
        transactionHash: tx.transactionHash,
      });
      return receipt.transactionHash;
    } catch (error) {
      console.error("Error lending loan:", error);
      return [];
    }
  }

  async function fundStartup(pId: number, amount: string) {
    const preparedTx = await prepareContractCall({
      contract,
      method: "function fundStartup(uint256 _id) payable",
      params: [BigInt(pId)],
      value: BigInt(toWei(amount)),
    });

    try {
      const tx = await sendTransaction({
        transaction: preparedTx,
        account: account,
      });

      const receipt = await waitForReceipt({
        client,
        chain,
        transactionHash: tx.transactionHash,
      });
      return receipt.transactionHash;
    } catch (error) {
      console.error("Error funding startup:", error);
      return [];
    }
  }

  async function withdrawStartupFunds(pId: number) {
    const preparedTx = await prepareContractCall({
      contract,
      method: "function withdrawFunds(uint256 _id)",
      params: [BigInt(pId)],
    });

    try {
      const tx = await sendTransaction({
        transaction: preparedTx,
        account: account,
      });

      const receipt = await waitForReceipt({
        client,
        chain,
        transactionHash: tx.transactionHash,
      });
      toast({
        title: "Withdrawal Successful",
        description: "Funds have been withdrawn successfully.",
        variant: "default", // Customizable variant
      });
      return receipt.transactionHash;
    } catch (error) {
      console.error("Error withdrawing startup funds:", error);

      toast({
        title: "Withdrawal Failed",
        description: "Cannot withdraw funds before deadline",
        variant: "destructive", // Error variant
      });
      return [];
    }
  }

  async function withdrawLoanFunds(lId: number) {
    const preparedTx = await prepareContractCall({
      contract,
      method: "function withdrawLoanFunds(uint256 _id)",
      params: [BigInt(lId)],
    });

    try {
      const tx = await sendTransaction({
        transaction: preparedTx,
        account: account,
      });

      const receipt = await waitForReceipt({
        client,
        chain,
        transactionHash: tx.transactionHash,
      });
      return receipt.transactionHash;
    } catch (error) {
      console.error("Error withdrawing loan funds:", error);
      return [];
    }
  }

  async function repayLoan(lId: number, amount: string) {
    const preparedTx = await prepareContractCall({
      contract,
      method: "function repayLoan(uint256 _id) payable",
      params: [BigInt(lId)],
      value: BigInt(toWei(amount)),
    });
    try {
      const tx = await sendTransaction({
        transaction: preparedTx,
        account: account,
      });

      const receipt = await waitForReceipt({
        client,
        chain,
        transactionHash: tx.transactionHash,
      });
      return receipt.transactionHash;
    } catch (error) {
      console.error("Error repaying loan:", error);
      return [];
    }
  }

  return (
    <StateContext.Provider
      value={{
        address,
        contract,
        account,
        createStartupCampaign,
        applyForLoan,
        getCampaigns,
        withdrawStartupFunds,
        getLoanRequests,
        withdrawLoanFunds,
        repayLoan,
        lendLoan,
        fundStartup,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => {
  const context = useContext(StateContext);
  if (context === undefined) {
    throw new Error(
      "useStateContext must be used within a StateContextProvider"
    );
  }
  return context;
};
