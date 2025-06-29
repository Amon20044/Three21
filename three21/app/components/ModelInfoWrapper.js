'use client';

import { ModelInfoProvider } from '../../components/ModelInfoContext';

export default function ModelInfoWrapper({ children }) {
    return (
        <ModelInfoProvider>
            {children}
        </ModelInfoProvider>
    );
}
