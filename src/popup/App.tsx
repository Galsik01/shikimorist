import React from 'react';
import './App.css';
import {Container} from 'inversify';
import {Provider as IoCProvider} from 'inversify-react';
import {MainPage} from './pages/main/Main';
import {AuthContextProvider} from './contexts/Authorization';
import {Provider as StoreProvider} from 'mobx-react';
import {TYPES} from '../iocTypes';

type Props = {
    container: Container;
}

const App: React.FC<Props> = (props) => {
    const mainStore = props.container.get(TYPES.stores.main);

    return (
        <IoCProvider container={props.container}>
            <StoreProvider
                mainStore={mainStore}
            >
                <AuthContextProvider>
                    <MainPage/>
                </AuthContextProvider>
            </StoreProvider>
        </IoCProvider>
    );
};

export default App;
