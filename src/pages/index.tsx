import React from "react";
import { Container } from "@mui/material";
import Layout from "../components/Layout";
import SpeechRecognition from "../components/SpeechRecognition";
import Head from "next/head";
import { ThemeProvider } from '@mui/material/styles';
import theme from '../styles/theme';
import TextToSpeech from "components/TextToSpeech";

const Home: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <Layout>
        <Head>
          <title>JINGJAI</title>
        </Head>
        <Container>
          <SpeechRecognition />
          <TextToSpeech />
        </Container>
      </Layout>
    </ThemeProvider>
  );
};

export default Home;
