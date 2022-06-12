import styled from "styled-components";
import confetti from "canvas-confetti";
import * as anchor from "@project-serum/anchor";
import {LAMPORTS_PER_SOL, PublicKey} from "@solana/web3.js";
import {useAnchorWallet} from "@solana/wallet-adapter-react";
import {WalletMultiButton} from "@solana/wallet-adapter-react-ui";
import {GatewayProvider} from '@civic/solana-gateway-react';
import Countdown from "react-countdown";
import {Snackbar, Paper, LinearProgress, Chip} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import {toDate, AlertState} from '../utils';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import { TestButton } from '../components/Button';

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  margin-bottom: 20px;
  margin-right: 4%;
  margin-left: 4%;
  text-align: center;
  justify-content: center;
`;


const WalletContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
`;

const WalletAmount = styled.div`
  color: black;
  width: auto;
  padding: 5px 5px 5px 16px;
  min-width: 48px;
  min-height: auto;
  border-radius: 22px;
  background-color: #995EAA ;
  box-shadow: 0px 3px 5px -1px rgb(0 0 0 / 20%), 0px 6px 10px 0px rgb(0 0 0 / 14%), 0px 1px 18px 0px rgb(0 0 0 / 12%);
  box-sizing: border-box;
  transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  font-weight: 500;
  line-height: 1.75;
  text-transform: uppercase;
  border: 0;
  margin: 0;
  display: inline-flex;
  outline: 0;
  position: relative;
  align-items: center;
  user-select: none;
  vertical-align: middle;
  justify-content: flex-start;
  gap: 10px;
`;

const Wallet = styled.ul`
  flex: 0 1 auto;
  margin: 0 auto;
  padding: 0;
  position: relative;

  animation-direction: normal;
  animation-timing-function: ease-in-out;
  animation-play-state: running;
  animation-delay: 0s;
  animation-duration: 1.2s;
  animation-iteration-count: 1;
  animation-name: moveLeft;
  @keyframes moveLeft {
  from {
    opacity: 0;
    transform: translateX(400px);
  }
  to {
    opacity: 1;
    transform: translateX(0px);
  }
}
`;

const MenuConnectButton = styled(WalletMultiButton)`
  border-radius: 18px !important;
  padding: 6px 16px;
  background-color: #E09EF3;
  margin: 0 auto;
  box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22) !important;
  text-shadow: 2px 2px 3px #7e7e7e;
  flex: 0 0 auto;
`;

const Price = styled(Chip)`
  position: absolute;
  background-color:var(--main-text-color) !important;
  box-shadow: 5px 5px 40px 5px rgba(0,0,0,0.5);
  margin: 5px;
  font-weight: bold;
  font-size: .8em !important;
  font-family: 'Press Start 2P', cursive !important;
`;

const Image = styled.img`
  height: 400px;
  width: auto;
  border-radius: 7px;
  box-shadow: 5px 5px 40px 5px rgba(0,0,0,0.5);
`;

const BorderLinearProgress = styled(LinearProgress)`
  margin: 20px;
  height: 10px !important;
  border-radius: 30px;
  border: 2px solid white;
  box-shadow: 5px 5px 40px 5px rgba(0,0,0,0.5);
  background-color:var(--main-text-color) !important;

  > div.MuiLinearProgress-barColorPrimary{
    background-color:var(--title-text-color) !important;
  }

  > div.MuiLinearProgress-bar1Determinate {
    border-radius: 30px !important;
    background-image: linear-gradient(270deg, rgba(255, 255, 255, 0.01), rgba(255, 255, 255, 0.5));
  }
`;


const NFT = styled(Paper)`
  align-items: center;
  display: flex;
  padding: 5px 20px;
  flex: 0 1 auto;
  background-color: var(--card-background-color) !important;
  box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22) !important;
`;

const TestBox = styled(Box)`
  min-height: 700px;
  min-width: 500px;
  max-width: 1350px;
  flex-direction: row;
  align-items: center;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  position: relative;
  flex: auto;
  border-radius: 5px;
  padding: 5px 10px;
  background-color: var(--card-background-color) !important;
  box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22) !important;

  animation-direction: normal;
  animation-timing-function: ease-in-out;
  animation-play-state: running;
  animation-delay: 0s;
  animation-duration: 1.2s;
  animation-iteration-count: 1;
  animation-name: fadeInAndmoveUp;
  @keyframes fadeInAndmoveUp {
  from {
    opacity: 0;
    transform: translateY(200px);
  }
  to {
    opacity: 1;
    transform: translateY(0px);
  }
}
`;

const RecentBidsAndSales = styled(Box)`
  min-height: 600px;
  min-width: 100px;
  max-width: 200px;
  align-items: center;
  display: flex;
  justify-content: center;
  border-radius: 5px;
  flex: auto;
  position: relative;
  margin-right: 45px;
  background-color: #E09EF3 !important;
  box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22) !important;

  animation-direction: normal;
  animation-timing-function: ease-in-out;
  animation-play-state: running;
  animation-delay: 0s;
  animation-duration: 1.2s;
  animation-iteration-count: 1;
  animation-name: fadeInAndmoveLeft;
  @keyframes fadeInAndmoveLeft {
  from {
    opacity: 0;
    transform: translateX(150px);
  }
  to {
    opacity: 1;
    transform: translateX(0px);
  }
}
`;

const Bar = styled(Box)`
  height: 100px;
  min-width: 600px;
  max-width: 1750px;
  align-items: center;
  display: inline-flex;
  justify-content: center;
  border-radius: 5px;
  position: relative;
  flex: auto;
  background-color: var(--card-background-color) !important;
  box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22) !important;

  animation-direction: normal;
  animation-timing-function: ease-in-out;
  animation-play-state: running;
  animation-delay: 0s;
  animation-duration: 1.2s;
  animation-iteration-count: 1;
  animation-name: fadeInAndmoveDown;
  @keyframes fadeInAndmoveDown {
  from {
    opacity: 0;
    transform: translateY(-100px);
  }
  to {
    opacity: 1;
    transform: translateY(0px);
  }
}

`;

const Des = styled(NFT)`
  text-align: left;
  padding-top: 0px;
`;

const SideMenu = styled(NFT)`
  justify-content: center;
  text-align: left;
  height: 100px;
  width: 100px;
`;

const BuyButton = styled(TestButton)`
  border-radius: 18px !important;
  padding: 6px 16px;
  background-color: #E09EF3;
  margin: 0 auto;
  box-shadow: 5px 5px 5px 4em rgba(255, 255, 255, 0);
`;

const Card = styled(Paper)`
  display: inline-flex;
  flex: 0 1 auto;
  flex-wrap: wrap;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: #E09EF3 !important;
  box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22) !important;
  margin: 35px 15px;
  min-width: 250px;
  min-height: 250px;
  padding: 10px 10px 20px;
  h1{
    margin:0px;
  }
  button{
    padding: 10px 20px;
  }
`;

const Logo = styled.div`
  flex: 0 0 auto;

  animation-direction: normal;
  animation-timing-function: ease-in-out;
  animation-play-state: running;
  animation-delay: 0s;
  animation-duration: 1.2s;
  animation-iteration-count: 1;
  animation-name: moveRight;
  @keyframes moveRight {
  from {
    opacity: 0;
    transform: translateX(-200px);
  }
  to {
    opacity: 1;
    transform: translateX(0px);
  }
}


  img {
    height: 60px;
  }
`;
const Menu = styled.ul`
  list-style: none;
  display: inline-flex;
  flex: 1 1 auto;
  justify-content: center;
  position: relative;
  text-shadow: 3px 2px 3px #7e7e7e;

  animation-direction: normal;
  animation-timing-function: ease-in-out;
  animation-play-state: running;
  animation-delay: 0s;
  animation-duration: 1.2s;
  animation-iteration-count: 1;
  animation-name: moveDownAndfadeIn;
  @keyframes moveDownAndfadeIn{
  from {
    opacity: 0;
    transform: translateY(-100px);
  }
  to {
    opacity: 1;
    transform: translateY(0px);
  }
}

  li {
    margin: 7px 12px 1px;

    a {
      color: var(--main-text-color);
      list-style-image: none;
      list-style-position: outside;
      list-style-type: none;
      outline: none;
      text-decoration: none;
      text-size-adjust: 100%;
      touch-action: manipulation;
      transition: color 0.3s;
      padding-bottom: 20px;

      img {
        max-height: 26px;
      }
    }

    a:hover, a:active {
      color: rgb(84, 55, 88);
      border-bottom: 4px solid var(--title-text-color);
    }

  }
`;

const SolExplorerLink = styled.a`
  color: var(--title-text-color);
  border-bottom: 1px solid var(--title-text-color);
  font-weight: bold;
  list-style-image: none;
  list-style-position: outside;
  list-style-type: none;
  outline: none;
  text-decoration: none;
  text-size-adjust: 100%;

  :hover {
    border-bottom: 2px solid var(--title-text-color);
  }
`;

const MintContainer = styled.div`
  display: inline-flex;
  flex-direction: row;
  align-content: center;
  justify-content: space-between;
  flex: 1 1 auto;
  flex-wrap: wrap;
  gap: 20px;
`;

const DesContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  gap: 20px;
  margin-bottom: 40px;
`;

export interface IAuctionPageProps {
  connection: anchor.web3.Connection;
  txTimeout: number;
  rpcHost: string;
};

const AuctionPage = (props: IAuctionPageProps) => {
  const [balance, setBalance] = useState<number>();
  const [isMinting, setIsMinting] = useState(false); // true when user got to press MINT
  const [isActive, setIsActive] = useState(false); // true when countdown completes or whitelisted
  const [solanaExplorerLink, setSolanaExplorerLink] = useState<string>("");
  const [itemsAvailable, setItemsAvailable] = useState(0);
  const [itemsRedeemed, setItemsRedeemed] = useState(0);
  const [itemsRemaining, setItemsRemaining] = useState(0);
  const [isSoldOut, setIsSoldOut] = useState(false);
  const [payWithSplToken, setPayWithSplToken] = useState(false);
  const [price, setPrice] = useState(0);
  const [priceLabel, setPriceLabel] = useState<string>("SOL");
  const [whitelistPrice, setWhitelistPrice] = useState(0);
  const [whitelistEnabled, setWhitelistEnabled] = useState(false);
  const [isBurnToken, setIsBurnToken] = useState(false);
  const [whitelistTokenBalance, setWhitelistTokenBalance] = useState(0);
  const [isEnded, setIsEnded] = useState(false);
  const [endDate, setEndDate] = useState<Date>();
  const [isPresale, setIsPresale] = useState(false);
  const [isWLOnly, setIsWLOnly] = useState(false);

  const [alertState, setAlertState] = useState<AlertState>({
      open: false,
      message: "",
      severity: undefined,
  });

  const wallet = useAnchorWallet();

    useEffect(() => {
      (async () => {
          if (wallet) {
              const balance = await props.connection.getBalance(wallet.publicKey);
              setBalance(balance / LAMPORTS_PER_SOL);
          }
      })();
    }, [wallet, props.connection]);



    return (
        <main>
            <MainContainer>
                <WalletContainer>
                    <Logo><a href="https://magesdao.vercel.app/home" target="_blank" rel="noopener noreferrer"><img alt=""
                                                                                                          src="MagesDAO.png"/></a></Logo>
                    <Menu>
                        <li><a href="https://twitter.com/Mages_DAO" target="_blank"
                                rel="noopener noreferrer">Twitter</a></li> <br />
                        <li><a href="https://discord.gg/7pAwWAFG" target="_blank"
                               rel="noopener noreferrer">Discord</a></li> <br />
                        <li><Link to="/swapui" target="_blank"
                               rel="/">SwapUI</Link></li> <br />
                        <li><Link to="/staking" target="_blank"
                               rel="/">Staking</Link></li> <br />
                        <li><Link to="/auctions" target="_blank"
                               rel="/">Auctions</Link></li> <br />
                    </Menu>
                    <Wallet>
                        {wallet ?
                            <WalletAmount>{(balance || 0).toLocaleString()} SOL<MenuConnectButton/></WalletAmount> :
                            <MenuConnectButton>Connect Wallet</MenuConnectButton>}
                    </Wallet>
                </WalletContainer>
                <br />
                <MintContainer>
                  <Bar>Auction Navbar Test</Bar>
                  <TestBox>
                    <Card>Buy</Card>
                    <Card>Buy</Card>
                    <Card>Buy</Card>
                    <Card>Buy</Card>
                    <Card>Buy</Card>
                    <Card>Buy</Card>
                    <Card>Buy</Card>
                    <Card>Buy</Card>
                    <Card>Buy</Card>
                    <Card>Buy</Card>
                    <Card>Buy</Card>
                    <Card>Buy</Card>
                    <Card>Buy</Card>
                    <Card>Buy</Card>
                    <Card>Buy</Card>
                    <Card>Buy</Card>
                    <Card>Buy</Card>
                    <Card>Buy</Card>
                    <Card>Buy</Card>
                    <Card>Buy</Card>
                  </TestBox>
                  <RecentBidsAndSales> Recent Bids and Sales </RecentBidsAndSales>
                </MintContainer>
            </MainContainer>
            <Snackbar
                open={alertState.open}
                autoHideDuration={6000}
                onClose={() => setAlertState({...alertState, open: false})}
            >
                <Alert
                    onClose={() => setAlertState({...alertState, open: false})}
                    severity={alertState.severity}
                >
                    {alertState.message}
                </Alert>
            </Snackbar>
        </main>
    )
};

export default AuctionPage;