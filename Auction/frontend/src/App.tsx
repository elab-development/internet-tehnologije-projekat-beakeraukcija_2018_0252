/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DeflyWalletConnect } from '@blockshake/defly-connect'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { DaffiWalletConnect } from '@daffiwallet/connect'
import { PeraWalletConnect } from '@perawallet/connect'
import { PROVIDER_ID, ProvidersArray, WalletProvider, useInitializeProviders, useWallet } from '@txnlab/use-wallet'
import algosdk from 'algosdk'
import { SnackbarProvider } from 'notistack'
import { useState } from 'react'
import AppCalls from './components/AppCalls'
import ConnectWallet from './components/ConnectWallet'
import { getAlgodConfigFromViteEnvironment } from './utils/network/getAlgoClientConfigs'
import Galery from './Gallery'
import Navbar from './Navbar'

export enum AuctionState {
  Pending,
  Started,
  Ended,
}

let providersArray: ProvidersArray
if (import.meta.env.VITE_ALGOD_NETWORK === '') {
  providersArray = [{ id: PROVIDER_ID.KMD }]
} else {
  providersArray = [
    { id: PROVIDER_ID.DEFLY, clientStatic: DeflyWalletConnect },
    { id: PROVIDER_ID.PERA, clientStatic: PeraWalletConnect },
    { id: PROVIDER_ID.DAFFI, clientStatic: DaffiWalletConnect },
    { id: PROVIDER_ID.EXODUS },

  ]
}

export default function App() {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const { activeAddress } = useWallet()
  const [auctionState, setAuctionState] = useState<AuctionState>(AuctionState.Pending)
  const [appID, setAppID] = useState<number>(0)

  const algodConfig = getAlgodConfigFromViteEnvironment()

  const toggleWalletModal = () => {
    setOpenWalletModal(!openWalletModal)
  }

  const walletProviders = useInitializeProviders({
    providers: providersArray,
    nodeConfig: {
      network: algodConfig.network,
      nodeServer: algodConfig.server,
      nodePort: String(algodConfig.port),
      nodeToken: String(algodConfig.token),
    },
    algosdkStatic: algosdk,
  })

  return (
    <SnackbarProvider maxSnack={3}>
      <WalletProvider value={walletProviders}>
        <Router>
          <Navbar />
          <Routes>
            <Route
              path="/"
              element={
                <div className="hero min-h-screen bg-teal-400">
                  <div className="hero-content text-center rounded-lg p-6 max-w-md bg-white mx-auto">
                    <div className="max-w-md">
                      <h1 className="text-4xl">
                        Welcome to <div className="font-bold">Auction 🙂</div>
                      </h1>
                      <p className="py-6">Bid for your favourite asset!</p>

                      <div className="grid">
                        <label htmlFor="app" className="label m-2">
                          App ID
                        </label>
                        <input
                          type="number"
                          id="app"
                          value={appID}
                          className="input input-bordered"
                          readOnly={true}
                          onChange={(e) => (e.target.valueAsNumber ? setAppID(e.target.valueAsNumber) : setAppID(0))}
                        />

                        <div className="divider" />
                        <button data-test-id="connect-wallet" className="btn m-2" onClick={toggleWalletModal}>
                          Wallet Connection
                        </button>

                        {activeAddress && appID === 0 && (
                          <AppCalls appID={appID} method="create" setAuctionState={setAuctionState} setAppID={setAppID} />
                        )}

                        {activeAddress && appID > 0 && auctionState !== AuctionState.Started && (
                          <AppCalls appID={appID} method="start" setAuctionState={setAuctionState} />
                        )}

                        {activeAddress && appID > 0 && auctionState === AuctionState.Started && (
                          <AppCalls appID={appID} method="bid" setAuctionState={setAuctionState} />
                        )}

                        {activeAddress && appID > 0 && auctionState === AuctionState.Started && (
                          <AppCalls appID={appID} method="reclaim_bids" setAuctionState={setAuctionState} />
                        )}

                        <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
                      </div>
                    </div>
                  </div>
                </div>
              }
            />
            <Route path="/galery" element={<Galery />} />

          </Routes>
        </Router>
      </WalletProvider>
    </SnackbarProvider>
  )
}
