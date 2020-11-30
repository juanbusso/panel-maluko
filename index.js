import React from "react";
import ReactDOM from "react-dom";
import { ThemeProvider } from "@material-ui/styles";
import { CssBaseline } from "@material-ui/core";

import Themes from "./themes";
import App from "./components/App";
import * as serviceWorker from "./serviceWorker";
import { LayoutProvider } from "./context/LayoutContext";
import { UserProvider } from "./context/UserContext";
import {CartProvider} from "./context/CartContext";
import {PriceListProvider} from "./context/PriceListContext";
import {MarketProvider} from "./context/MarketContext";
import {ProductsProvider} from "./context/ProductsContext";


ReactDOM.render(
  <LayoutProvider>
      <div id="recaptcha-container" />
      <ThemeProvider theme={Themes.default}>
          <CssBaseline />
          <UserProvider>
            <MarketProvider>
                <PriceListProvider>
                    <CartProvider>
                        <ProductsProvider>
                                <App />
                        </ProductsProvider>
                    </CartProvider>
                </PriceListProvider>
            </MarketProvider>
        </UserProvider>
      </ThemeProvider>
  </LayoutProvider>,
  document.getElementById("root"),
);


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
