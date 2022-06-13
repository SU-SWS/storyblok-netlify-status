import '../styles/global.css'

export default function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <Component {...pageProps} />
  )
}
