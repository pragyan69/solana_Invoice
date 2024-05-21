"use client";
import { NextPage } from "next";
import styles from "./Styles/Home.module.css";
import WalletContextProvider from "./Context/WalletProvider";
import { AppBar } from "./components/AppBar";
import Head from "next/head";
import { InvoiceForm } from "./components/invoiceForm";
// import BurnCNFTButton from "./components/BurnCNFTButton"
// import SimpleTransferQrCodePage from "./components/pay";
const Home: NextPage = (props) => {
  return (
    <>
      <WalletContextProvider>
        <Head>
          <title>SuperInvoice</title>
          <meta name="description" content="SuperInvoice" />
        </Head>
        {/* <AppBar /> */}
        <div>
          <InvoiceForm />
        </div>
      </WalletContextProvider>
    </>
  );
};

export default Home;
