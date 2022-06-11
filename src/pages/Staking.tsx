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

const ConnectButton = styled(WalletMultiButton)`
  border-radius: 18px !important;
  padding: 6px 16px;
  background-color: #E09EF3;
  margin: 0 auto;
  box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22) !important;
`;

const NFT = styled(Paper)`
  min-width: 1750px;
  align-items: center;
  display: flex;
  padding: 5px 20px;
  flex: 0 1 auto;
  background-color: var(--card-background-color) !important;
  box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22) !important;
`;

const TestBox = styled(Box)`
  min-height: 800px;
  min-width: 500px;
  flex-direction: column;
  align-items: center;
  display: inline-flex;
  justify-content: center;
  border-radius: 5px;
  padding: 5px 10px;
  flex: 1 1 auto;
  background-color: var(--card-background-color) !important;
  box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22) !important;
`;

const StakeBox = styled(Box)`
  min-height: 800px;
  min-width: 100px;
  max-width: 300px;
  align-items: center;
  display: inline-flex;
  justify-content: center;
  border-radius: 5px;
  padding: 5px 10px;
  flex: auto;
  background-color: var(--card-background-color) !important;
  box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22) !important;
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
  background-color: var(card-background-lighter-color) !important;
  margin: 25px 10px;
  min-width: 250px;
  min-height: 250px;
  padding: 10px 20px;
  h1{
    margin:0px;
  }
  button{
    padding: 10px 20px;
  }
`;

const Logo = styled.div`
  flex: 0 0 auto;

  img {
    height: 60px;
  }
`;
const Menu = styled.ul`
  list-style: none;
  display: inline-flex;
  flex: 1 0 auto;
  justify-content: center;

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
  display: flex;
  flex-direction: row;
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

export interface IStakingPageProps {};

const StakingPage = (props: IStakingPageProps) => {
    const [message, setMessage] = useState('');
    const { number } = useParams();

    const [balance, setBalance] = useState<number>();
    const wallet = useAnchorWallet();

    const [alertState, setAlertState] = useState<AlertState>({
        open: false,
        message: "",
        severity: undefined,
    });


    useEffect(() => {
        if (number) {
            setMessage('The number is ' + number);
        } else {
            setMessage('No number provided');
        }
    }, []);

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
                            <WalletAmount>{(balance || 0).toLocaleString()} SOL<ConnectButton/></WalletAmount> :
                            <ConnectButton>Connect Wallet</ConnectButton>}
                    </Wallet>
                </WalletContainer>
                <br />
                <MintContainer>
                  <StakeBox>
                    Stake Box
                  </StakeBox>
                  <TestBox>
                    Test Box
                  </TestBox>
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

export default StakingPage;