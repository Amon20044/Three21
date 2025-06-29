import { ModelInfoProvider } from '../components/ModelInfoContext';
import '../app/globals.css';

export default function MyApp({ Component, pageProps }) {
    return (
        <ModelInfoProvider>
            <Component {...pageProps} />
        </ModelInfoProvider>
    );
}
