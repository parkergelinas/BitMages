import * as React from "react";
import { useEffect, useState } from "react";
import styled from "styled-components";
import confetti from "canvas-confetti";
import * as anchor from "@project-serum/anchor";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { GatewayProvider } from "@civic/solana-gateway-react";
import Countdown from "react-countdown";
import { Snackbar, Paper, LinearProgress, Chip } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { toDate, AlertState, getAtaForMint } from "../utils";
import { MintButton } from "../components/MintButton";
import {
  CandyMachine,
  awaitTransactionSignatureConfirmation,
  getCandyMachineState,
  mintOneToken,
  CANDY_MACHINE_PROGRAM,
} from "../candy-machine";
import { Link } from "react-router-dom";

const cluster = process.env.REACT_APP_SOLANA_NETWORK!.toString();
const decimals = process.env.REACT_APP_SPL_TOKEN_TO_MINT_DECIMALS
  ? +process.env.REACT_APP_SPL_TOKEN_TO_MINT_DECIMALS!.toString()
  : 9;
const splTokenName = process.env.REACT_APP_SPL_TOKEN_TO_MINT_NAME
  ? process.env.REACT_APP_SPL_TOKEN_TO_MINT_NAME.toString()
  : "TOKEN";

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
  background-color: #995eaa;
  box-shadow: 0px 3px 5px -1px rgb(0 0 0 / 20%),
    0px 6px 10px 0px rgb(0 0 0 / 14%), 0px 1px 18px 0px rgb(0 0 0 / 12%);
  box-sizing: border-box;
  transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
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
  animation-duration: 1s;
  animation-iteration-count: 1;
  animation-name: fadeInAndmoveLeft;
  @keyframes fadeInAndmoveLeft {
    from {
      opacity: 0;
      transform: translateX(200px);
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
  background-color: #e09ef3;
  margin: 0 auto;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22) !important;
  text-shadow: 2px 2px 3px #7e7e7e;
`;

const MintConnectButton = styled(WalletMultiButton)`
  border-radius: 18px !important;
  padding: 6px 16px;
  background-color: #e09ef3;
  margin: 0 auto;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22) !important;
  text-shadow: 2px 2px 3px #7e7e7e;

  animation-direction: normal;
  animation-timing-function: ease-in-out;
  animation-play-state: running;
  animation-delay: 0s;
  animation-duration: 1s;
  animation-iteration-count: 1;
  animation-name: fadeIn;
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateX(0px);
    }
    to {
      opacity: 1;
      transform: translateX(0px);
    }
  }
`;

const NFT = styled(Paper)`
  min-width: 500px;
  padding: 5px 20px 5px 20px;
  flex: 1 1 auto;
  background-color: var(--card-background-color) !important;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22) !important;
  text-shadow: 2px 2px 3px #3f3f3f;

  animation-direction: normal;
  animation-timing-function: ease-in-out;
  animation-delay: 0s;
  animation-duration: 1s;
  animation-iteration-count: 1;
  animation-name: fadeIn;
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const Des = styled(NFT)`
  text-align: left;
  text-shadow: 2px 2px 3px #3f3f3f;
  padding-top: 0px;

  animation-direction: normal;
  animation-timing-function: ease-in-out;
  animation-play-state: running;
  animation-delay: 0s;
  animation-duration: 1s;
  animation-iteration-count: 1;
  animation-name: fadeInAndmoveUp;
  @keyframes fadeInAndmoveUp {
    from {
      opacity: 0;
      transform: translateY(150px);
    }
    to {
      opacity: 1;
      transform: translateY(0px);
    }
  }
`;

const Card = styled(Paper)`
  display: inline-block;
  background-color: var(card-background-lighter-color) !important;
  margin: 5px;
  min-width: 40px;
  padding: 5px 20px 5px 20px;
  h1 {
    margin: 0px;
  }
`;

const MintButtonContainer = styled.div`
  button.MuiButton-contained:not(.MuiButton-containedPrimary).Mui-disabled {
    color: #000000;
  }

  button.MuiButton-contained:not(.MuiButton-containedPrimary):hover,
  button.MuiButton-contained:not(.MuiButton-containedPrimary):focus {
    -webkit-animation: pulse 1s;
    animation: pulse 1s;
    box-shadow: 0 0 0 2em rgba(255, 255, 255, 0);
  }

  @-webkit-keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 #c39fd1;
    }
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 #a57db4;
    }
  }
`;

const Logo = styled.div`
  flex: 0 0 auto;
  margin-top: 15px;
  margin-left: 25px;

  animation-direction: normal;
  animation-timing-function: ease-in-out;
  animation-play-state: running;
  animation-delay: 0s;
  animation-duration: 1s;
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
    height: 40px;
  }
`;
const Menu = styled.ul`
  list-style: none;
  display: inline-flex;
  flex: 1 1 auto;
  justify-content: center;
  text-shadow: 2px 2px 3px #7e7e7e;
  margin-right: 70px;

  animation-direction: normal;
  animation-timing-function: ease-in-out;
  animation-play-state: running;
  animation-delay: 0s;
  animation-duration: 1s;
  animation-iteration-count: 1;
  animation-name: moveDownAndfadeIn;
  @keyframes moveDownAndfadeIn {
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

    a:hover,
    a:active {
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

const MintContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1 1 auto;
  flex-wrap: wrap;
  gap: 20px;

  animation-direction: normal;
  animation-timing-function: ease-in-out;
  animation-play-state: running;
  animation-delay: 0s;
  animation-duration: 1s;
  animation-iteration-count: 1;
  animation-name: fadeInAndmoveUp;
  @keyframes fadeInAndmoveUp {
    from {
      opacity: 0;
      transform: translateY(150px);
    }
    to {
      opacity: 1;
      transform: translateY(0px);
    }
  }
`;

const DesContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  gap: 20px;
  margin-bottom: 40px;
`;

const Price = styled(Chip)`
  position: absolute;
  background-color: var(--main-text-color) !important;
  box-shadow: 5px 5px 40px 5px rgba(0, 0, 0, 0.5);
  margin: 5px;
  font-weight: bold;
  font-size: 0.8em !important;
  font-family: "Press Start 2P", cursive !important;
`;

const Image = styled.img`
  height: 400px;
  width: auto;
  border-radius: 7px;
  box-shadow: 5px 5px 40px 5px rgba(0, 0, 0, 0.5);
`;

const BorderLinearProgress = styled(LinearProgress)`
  margin: 10px;
  height: 15px !important;
  border-radius: 5px;
  border: 2px solid white;
  box-shadow: 5px 5px 40px 5px rgba(0, 0, 0, 0.5);
  background-color: #7d6686 !important;

  > div.MuiLinearProgress-barColorPrimary {
    background-color: var(--title-text-color) !important;
  }

  > div.MuiLinearProgress-bar1Determinate {
    border-radius: 30px !important;
    background-image: linear-gradient(
      270deg,
      rgba(255, 255, 255, 0.01),
      rgba(255, 255, 255, 0.5)
    );
  }
`;

const GoldTitle = styled.h2`
  color: var(--title-text-color);
`;

const LogoAligner = styled.div`
  display: flex;
  align-items: center;

  img {
    max-height: 35px;
    margin-right: 10px;
  }
`;

export interface IHomePageProps {
  candyMachineId: anchor.web3.PublicKey;
  connection: anchor.web3.Connection;
  txTimeout: number;
  rpcHost: string;
}

const Home = (props: IHomePageProps) => {
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
  const [candyMachine, setCandyMachine] = useState<CandyMachine>();

  const rpcUrl = props.rpcHost;

  const refreshCandyMachineState = () => {
    (async () => {
      if (!wallet) return;

      const cndy = await getCandyMachineState(
        wallet as anchor.Wallet,
        props.candyMachineId,
        props.connection
      );

      setCandyMachine(cndy);
      setItemsAvailable(cndy.state.itemsAvailable);
      setItemsRemaining(cndy.state.itemsRemaining);
      setItemsRedeemed(cndy.state.itemsRedeemed);

      var divider = 1;
      if (decimals) {
        divider = +("1" + new Array(decimals).join("0").slice() + "0");
      }

      // detect if using spl-token to mint
      if (cndy.state.tokenMint) {
        setPayWithSplToken(true);
        // Customize your SPL-TOKEN Label HERE
        // TODO: get spl-token metadata name
        setPriceLabel(splTokenName);
        setPrice(cndy.state.price.toNumber() / divider);
        setWhitelistPrice(cndy.state.price.toNumber() / divider);
      } else {
        setPrice(cndy.state.price.toNumber() / LAMPORTS_PER_SOL);
        setWhitelistPrice(cndy.state.price.toNumber() / LAMPORTS_PER_SOL);
      }

      // fetch whitelist token balance
      if (cndy.state.whitelistMintSettings) {
        setWhitelistEnabled(true);
        setIsBurnToken(cndy.state.whitelistMintSettings.mode.burnEveryTime);
        setIsPresale(cndy.state.whitelistMintSettings.presale);
        setIsWLOnly(
          !isPresale && cndy.state.whitelistMintSettings.discountPrice === null
        );

        if (
          cndy.state.whitelistMintSettings.discountPrice !== null &&
          cndy.state.whitelistMintSettings.discountPrice !== cndy.state.price
        ) {
          if (cndy.state.tokenMint) {
            setWhitelistPrice(
              cndy.state.whitelistMintSettings.discountPrice?.toNumber() /
                divider
            );
          } else {
            setWhitelistPrice(
              cndy.state.whitelistMintSettings.discountPrice?.toNumber() /
                LAMPORTS_PER_SOL
            );
          }
        }

        let balance = 0;
        try {
          const tokenBalance = await props.connection.getTokenAccountBalance(
            (
              await getAtaForMint(
                cndy.state.whitelistMintSettings.mint,
                wallet.publicKey
              )
            )[0]
          );

          balance = tokenBalance?.value?.uiAmount || 0;
        } catch (e) {
          console.error(e);
          balance = 0;
        }
        setWhitelistTokenBalance(balance);
        setIsActive(isPresale && !isEnded && balance > 0);
      } else {
        setWhitelistEnabled(false);
      }

      // end the mint when date is reached
      if (cndy?.state.endSettings?.endSettingType.date) {
        setEndDate(toDate(cndy.state.endSettings.number));
        if (
          cndy.state.endSettings.number.toNumber() <
          new Date().getTime() / 1000
        ) {
          setIsEnded(true);
          setIsActive(false);
        }
      }
      // end the mint when amount is reached
      if (cndy?.state.endSettings?.endSettingType.amount) {
        let limit = Math.min(
          cndy.state.endSettings.number.toNumber(),
          cndy.state.itemsAvailable
        );
        setItemsAvailable(limit);
        if (cndy.state.itemsRedeemed < limit) {
          setItemsRemaining(limit - cndy.state.itemsRedeemed);
        } else {
          setItemsRemaining(0);
          cndy.state.isSoldOut = true;
          setIsEnded(true);
        }
      } else {
        setItemsRemaining(cndy.state.itemsRemaining);
      }

      if (cndy.state.isSoldOut) {
        setIsActive(false);
      }
    })();
  };

  const renderGoLiveDateCounter = ({ days, hours, minutes, seconds }: any) => {
    return (
      <div>
        <Card elevation={1}>
          <h1>{days}</h1>Days
        </Card>
        <Card elevation={1}>
          <h1>{hours}</h1>
          Hours
        </Card>
        <Card elevation={1}>
          <h1>{minutes}</h1>Mins
        </Card>
        <Card elevation={1}>
          <h1>{seconds}</h1>Secs
        </Card>
      </div>
    );
  };

  const renderEndDateCounter = ({ days, hours, minutes }: any) => {
    let label = "";
    if (days > 0) {
      label += days + " days ";
    }
    if (hours > 0) {
      label += hours + " hours ";
    }
    label += minutes + 1 + " minutes left to MINT.";
    return (
      <div>
        <h3>{label}</h3>
      </div>
    );
  };

  function displaySuccess(mintPublicKey: any): void {
    let remaining = itemsRemaining - 1;
    setItemsRemaining(remaining);
    setIsSoldOut(remaining === 0);
    if (isBurnToken && whitelistTokenBalance && whitelistTokenBalance > 0) {
      let balance = whitelistTokenBalance - 1;
      setWhitelistTokenBalance(balance);
      setIsActive(isPresale && !isEnded && balance > 0);
    }
    setItemsRedeemed(itemsRedeemed + 1);
    const solFeesEstimation = 0.012; // approx
    if (!payWithSplToken && balance && balance > 0) {
      setBalance(
        balance -
          (whitelistEnabled ? whitelistPrice : price) -
          solFeesEstimation
      );
    }
    setSolanaExplorerLink(
      cluster === "devnet" || cluster === "testnet"
        ? "https://solscan.io/token/" + mintPublicKey + "?cluster=" + cluster
        : "https://solscan.io/token/" + mintPublicKey
    );
    throwConfetti();
  }

  function throwConfetti(): void {
    confetti({
      particleCount: 400,
      spread: 70,
      origin: { y: 0.6 },
    });
  }

  const onMint = async () => {
    try {
      setIsMinting(true);
      if (wallet && candyMachine?.program && wallet.publicKey) {
        const mint = anchor.web3.Keypair.generate();
        const mintTxId = (
          await mintOneToken(candyMachine, wallet.publicKey, mint)
        )[0];

        let status: any = { err: true };
        if (mintTxId) {
          status = await awaitTransactionSignatureConfirmation(
            mintTxId,
            props.txTimeout,
            props.connection,
            "singleGossip",
            true
          );
        }

        if (!status?.err) {
          setAlertState({
            open: true,
            message: "Congratulations! Mint succeeded!",
            severity: "success",
          });

          // update front-end amounts
          displaySuccess(mint.publicKey);
        } else {
          setAlertState({
            open: true,
            message: "Mint failed! Please try again!",
            severity: "error",
          });
        }
      }
    } catch (error: any) {
      // TODO: blech:
      let message = error.msg || "Minting failed! Please try again!";
      if (!error.msg) {
        if (!error.message) {
          message = "Transaction Timeout! Please try again.";
        } else if (error.message.indexOf("0x138")) {
        } else if (error.message.indexOf("0x137")) {
          message = `SOLD OUT!`;
        } else if (error.message.indexOf("0x135")) {
          message = `Insufficient funds to mint. Please fund your wallet.`;
        }
      } else {
        if (error.code === 311) {
          message = `SOLD OUT!`;
        } else if (error.code === 312) {
          message = `Minting period hasn't started yet.`;
        }
      }

      setAlertState({
        open: true,
        message,
        severity: "error",
      });
    } finally {
      setIsMinting(false);
    }
  };

  useEffect(() => {
    (async () => {
      if (wallet) {
        const balance = await props.connection.getBalance(wallet.publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      }
    })();
  }, [wallet, props.connection]);

  useEffect(refreshCandyMachineState, [
    wallet,
    props.candyMachineId,
    props.connection,
    isEnded,
    isPresale,
  ]);

  return (
    <main>
      <MainContainer>
        <WalletContainer>
          <Logo>
            <a
              href="https://bitmages.vercel.app/home"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img alt="" src="BitMageLogo1.png" />
            </a>
          </Logo>
          <Menu>
            <li>
              <a
                href="https://twitter.com/BitMages"
                target="_blank"
                rel="noopener noreferrer"
              >
                Twitter
              </a>
            </li>{" "}
            <br />
            <li>
              <a
                href="https://discord.gg/7pAwWAFG"
                target="_blank"
                rel="noopener noreferrer"
              >
                Discord
              </a>
            </li>{" "}
            <br />
            <li>
              <Link to="/swapui" target="_blank" rel="/">
                SwapUI
              </Link>
            </li>{" "}
            <br />
            <li>
              <Link to="/staking" target="_blank" rel="/">
                Staking
              </Link>
            </li>{" "}
            <br />
            <li>
              <Link to="/auctions" target="_blank" rel="/">
                Auctions
              </Link>
            </li>{" "}
            <br />
          </Menu>
          <Wallet>
            {wallet ? (
              <WalletAmount>
                {(balance || 0).toLocaleString()} SOL
                <MenuConnectButton />
              </WalletAmount>
            ) : (
              <MenuConnectButton>Connect Wallet</MenuConnectButton>
            )}
          </Wallet>
        </WalletContainer>
        <br />
        <MintContainer>
          <DesContainer>
            <NFT elevation={3}>
              <h2>BitMages</h2>
              <br />
              <div>
                <Price
                  label={
                    isActive && whitelistEnabled && whitelistTokenBalance > 0
                      ? whitelistPrice + " " + priceLabel
                      : price + " " + priceLabel
                  }
                />
                <Image src="magesgif.gif" alt="NFT To Mint" />
              </div>
              <br />
              {wallet &&
                isActive &&
                whitelistEnabled &&
                whitelistTokenBalance > 0 &&
                isBurnToken && (
                  <h3>
                    You own {whitelistTokenBalance} WL mint{" "}
                    {whitelistTokenBalance > 1 ? "tokens" : "token"}.
                  </h3>
                )}
              {wallet &&
                isActive &&
                whitelistEnabled &&
                whitelistTokenBalance > 0 &&
                !isBurnToken && (
                  <h3>You are whitelisted and allowed to mint.</h3>
                )}

              {wallet && isActive && endDate && Date.now() < endDate.getTime() && (
                <Countdown
                  date={toDate(candyMachine?.state?.endSettings?.number)}
                  onMount={({ completed }) => completed && setIsEnded(true)}
                  onComplete={() => {
                    setIsEnded(true);
                  }}
                  renderer={renderEndDateCounter}
                />
              )}
              {wallet && isActive && (
                <h3>
                  TOTAL MINTED : {itemsRedeemed} / {itemsAvailable}
                </h3>
              )}
              {wallet && isActive && (
                <BorderLinearProgress
                  variant="determinate"
                  value={100 - (itemsRemaining * 100) / itemsAvailable}
                />
              )}
              <br />
              <MintButtonContainer>
                {!isActive &&
                !isEnded &&
                candyMachine?.state.goLiveDate &&
                (!isWLOnly || whitelistTokenBalance > 0) ? (
                  <Countdown
                    date={toDate(candyMachine?.state.goLiveDate)}
                    onMount={({ completed }) =>
                      completed && setIsActive(!isEnded)
                    }
                    onComplete={() => {
                      setIsActive(!isEnded);
                    }}
                    renderer={renderGoLiveDateCounter}
                  />
                ) : !wallet ? (
                  <MintConnectButton>Connect Wallet</MintConnectButton>
                ) : !isWLOnly || whitelistTokenBalance > 0 ? (
                  candyMachine?.state.gatekeeper &&
                  wallet.publicKey &&
                  wallet.signTransaction ? (
                    <GatewayProvider
                      wallet={{
                        publicKey:
                          wallet.publicKey ||
                          new PublicKey(CANDY_MACHINE_PROGRAM),
                        //@ts-ignore
                        signTransaction: wallet.signTransaction,
                      }}
                      // // Replace with following when added
                      // gatekeeperNetwork={candyMachine.state.gatekeeper_network}
                      gatekeeperNetwork={
                        candyMachine?.state?.gatekeeper?.gatekeeperNetwork
                      } // This is the ignite (captcha) network
                      /// Don't need this for mainnet
                      clusterUrl={rpcUrl}
                      options={{ autoShowModal: false }}
                    >
                      <MintButton
                        candyMachine={candyMachine}
                        isMinting={isMinting}
                        isActive={isActive}
                        isEnded={isEnded}
                        isSoldOut={isSoldOut}
                        onMint={onMint}
                      />
                    </GatewayProvider>
                  ) : (
                    <MintButton
                      candyMachine={candyMachine}
                      isMinting={isMinting}
                      isActive={isActive}
                      isEnded={isEnded}
                      isSoldOut={isSoldOut}
                      onMint={onMint}
                    />
                  )
                ) : (
                  <h1>Mint is private.</h1>
                )}
              </MintButtonContainer>
              <br />
              {wallet && isActive && solanaExplorerLink && (
                <SolExplorerLink href={solanaExplorerLink} target="_blank">
                  View on Solscan
                </SolExplorerLink>
              )}
            </NFT>
          </DesContainer>
        </MintContainer>
        <DesContainer>
          <Des elevation={1}>
            <LogoAligner>
              <GoldTitle>BitMages</GoldTitle>
            </LogoAligner>
            <p>
              {" "}
              Mages is an NFT community meant for builders & degens with long
              term goals.
            </p>
            <p>
              {" "}
              We plan on releasing multiple rounds of Mages, with the initial
              round at 100 mages.
            </p>
          </Des>
          <Des elevation={1}>
            <LogoAligner>
              <GoldTitle>Project Future</GoldTitle>
            </LogoAligner>
            <p>
              {" "}
              As this project develops, staking & other systems will be looked
              into, and to be implemented as seen fit.{" "}
            </p>
            <p>
              {" "}
              These systems may include staking, tokens, auctions, a game,
              airdrops, and any innovative contracts to Solana.{" "}
            </p>
          </Des>
        </DesContainer>
      </MainContainer>
      <Snackbar
        open={alertState.open}
        autoHideDuration={6000}
        onClose={() => setAlertState({ ...alertState, open: false })}
      >
        <Alert
          onClose={() => setAlertState({ ...alertState, open: false })}
          severity={alertState.severity}
        >
          {alertState.message}
        </Alert>
      </Snackbar>
    </main>
  );
};

export default Home;
