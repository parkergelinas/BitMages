import React from "react";
import styled from "styled-components";
import { useEffect, useState } from "react";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import {
  Connection,
  PublicKey,
  Keypair,
  clusterApiUrl,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import Button from "@material-ui/core/Button";
import { CircularProgress } from "@material-ui/core";
import { GatewayStatus, useGateway } from "@civic/solana-gateway-react";
import { CandyMachine } from "../candy-machine";
import { buy } from "../api/src/auction-house";

export const CTAButton = styled(Button)`
  display: block !important;
  margin: 0 auto !important;
  background-color: #e09ef3 !important;
  box-shadow: 5px 5px 4em rgba(255, 255, 255, 0);
  min-width: 120px !important;
  font-size: 1em !important;
`;

export const BuyButton: React.FC = () => {
  const { connection } = useConnection();
  let walletAddress = "";
  var AuctionAddress = "";

  // if you use anchor, use the anchor hook instead
  // const wallet = useAnchorWallet();
  // const walletAddress = wallet?.publicKey.toString();
  const wallet = useWallet();

  function getBuy() {
    buy({
      auctionHouse: AuctionAddress,
      buyPrice: price,
      tokenSize: "1",
      mint: mintAddress,
      env: "devnet",
      keypair: Keypair.generate().secretKey,
    }).then((x) => {
      alert("Buy / offer Action" + "Offer: " + x);
    });
  }
  if (wallet.connected && wallet.publicKey) {
    walletAddress = wallet.publicKey.toString();
  }

  const [price, setInput] = useState(""); // '' is the initial state value
  const [mintAddress, setInput2] = useState(""); // '' is the initial state value

  return <CTAButton onClick={getBuy}>Buy</CTAButton>;
};
