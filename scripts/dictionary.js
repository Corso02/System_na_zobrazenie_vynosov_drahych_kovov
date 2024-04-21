/**
 * This namespace contains all dictionaries that are needed for this web app.
 * When new comodity/currency is added, its crucial to update this dictionaries as well to ensure compatibility with new comodity/currency
 * @namespace FrontendDictionary
 */

/**
 * 
 * This object is used in graph title. Only used in graphs.js file. Function {@link Graphs.getComodity} is used to retrieve value to access this dictionary values. See example to see current state of this dict.
 * @memberof FrontendDictionary
 * @example
 *  {
 *    "Gold": "zlata",
 *    "sp500": "S&P 500",
 *    "Silver": "striebra"
 *  }
 */
const comodity_to_title = {
    "Gold": "zlata",
    "sp500": "S&P 500",
    "Silver": "striebra"
};

/**
 * Used in {@link Tables.choose_comodity_to_add} to generate HTML select element for comodity, this object is in &lt;comodity name>:&lt;string to show user> format. See example to see current state of this dict.
 * @memberof FrontendDictionary
 * @example
 * {
 *   "gold": "Zlato",
 *   "sp500": "S&P 500",
 *   "silver": "Striebro"
 * }
 */
const dict = {
    "gold": "Zlato",
    "sp500": "S&P 500",
    "silver": "Striebro"
};

/** 
 * Used in {@link Tables.choose_comodity_to_add} and {@link Graphs.create_graph} to generate HTML select element for currency, this object in in &lt;currency id>:&lt;emoji flag code; currency> format. See example to see current state of this dict.
 * @memberof FrontendDictionary
 * @example
 * {
 *   "1": "&#127482;&#127480; USD",
 *   "2": "&#127466;&#127482; EUR"
 * }
 */
let currency_dict_select = {
    "1": "&#127482;&#127480; USD",
    "2": "&#127466;&#127482; EUR"
};

/**
 * Used in {@link Graphs.create_graph} to generate label, this object is in &lt;currency id>:&lt;currency name> format. See example to see current state of this dict.
 * @memberof FrontendDictionary
 * @example
 * {
 *   "1": "USD",
 *   "2": "EUR"
 * }
 */
let currency_dict = {
    "1": "USD",
    "2": "EUR"
};