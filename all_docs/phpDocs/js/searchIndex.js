Search.appendIndex(
    [
                {
            "fqsen": "\\handle_request\u0028\u0029",
            "name": "handle_request",
            "summary": "API\u0020endpoint\u0020for\u0020AP\u0020tables.",
            "url": "namespaces/default.html#function_handle_request"
        },                {
            "fqsen": "\\get_conversion_rates\u0028\u0029",
            "name": "get_conversion_rates",
            "summary": "",
            "url": "namespaces/default.html#function_get_conversion_rates"
        },                {
            "fqsen": "\\get_conversion_rate_on_date\u0028\u0029",
            "name": "get_conversion_rate_on_date",
            "summary": "",
            "url": "namespaces/default.html#function_get_conversion_rate_on_date"
        },                {
            "fqsen": "\\Database",
            "name": "Database",
            "summary": "This\u0020class\u0020is\u0020used\u0020for\u0020querying\u0020SQLite\u0020database.\u0020Each\u0020statement\u0020is\u0020prepared\u0020to\u0020counter\u0020SQL\u0020injection.",
            "url": "classes/Database.html"
        },                {
            "fqsen": "\\Database\u003A\u003A__construct\u0028\u0029",
            "name": "__construct",
            "summary": "",
            "url": "classes/Database.html#method___construct"
        },                {
            "fqsen": "\\Database\u003A\u003Ainsert\u0028\u0029",
            "name": "insert",
            "summary": "Function\u0020to\u0020insert\u0020data\u0020into\u0020table\u0020prices",
            "url": "classes/Database.html#method_insert"
        },                {
            "fqsen": "\\Database\u003A\u003Aget_currencies\u0028\u0029",
            "name": "get_currencies",
            "summary": "Retrieve\u0020all\u0020currencies\u0020from\u0020database\nThis\u0020function\u0020is\u0020mainly\u0020used\u0020on\u0020frontend\u0020to\u0020generate\u0020select\u0020elements\u0020for\u0020user\u0020to\u0020choose\u0020currency\u0020to\u0020work\u0020with.",
            "url": "classes/Database.html#method_get_currencies"
        },                {
            "fqsen": "\\Database\u003A\u003Aget_currencies_with_ids\u0028\u0029",
            "name": "get_currencies_with_ids",
            "summary": "Retrieve\u0020all\u0020currencies\u0020with\u0020ids\u0020from\u0020database",
            "url": "classes/Database.html#method_get_currencies_with_ids"
        },                {
            "fqsen": "\\Database\u003A\u003Aget_comodities\u0028\u0029",
            "name": "get_comodities",
            "summary": "Retrieve\u0020all\u0020comodities\u0020from\u0020database\nThis\u0020function\u0020is\u0020mainly\u0020used\u0020on\u0020frontend\u0020to\u0020generate\u0020select\u0020elements\u0020for\u0020user\u0020to\u0020choose\u0020comodity\u0020to\u0020work\u0020with.",
            "url": "classes/Database.html#method_get_comodities"
        },                {
            "fqsen": "\\Database\u003A\u003Aget_comodity_id\u0028\u0029",
            "name": "get_comodity_id",
            "summary": "Get\u0020comodity\u0020id\u0020based\u0020on\u0020given\u0020name.",
            "url": "classes/Database.html#method_get_comodity_id"
        },                {
            "fqsen": "\\Database\u003A\u003Aget_price_by_date_and_currency\u0028\u0029",
            "name": "get_price_by_date_and_currency",
            "summary": "Retrieve\u0020price\u0020of\u0020given\u0020comodity,\u0020currency\u0020and\u0020date",
            "url": "classes/Database.html#method_get_price_by_date_and_currency"
        },                {
            "fqsen": "\\Database\u003A\u003Aget_last_price_in_month\u0028\u0029",
            "name": "get_last_price_in_month",
            "summary": "Retrieve\u0020last\u0020price\u0020of\u0020given\u0020comodity,\u0020in\u0020given\u0020currency\u0020in\u0020given\u0020month\u0020and\u0020year",
            "url": "classes/Database.html#method_get_last_price_in_month"
        },                {
            "fqsen": "\\Database\u003A\u003Aget_first_price_in_month\u0028\u0029",
            "name": "get_first_price_in_month",
            "summary": "Retrieve\u0020first\u0020price\u0020of\u0020given\u0020comodity,\u0020in\u0020given\u0020currency\u0020in\u0020given\u0020month\u0020and\u0020year",
            "url": "classes/Database.html#method_get_first_price_in_month"
        },                {
            "fqsen": "\\Database\u003A\u003Aget_first_price_in_year\u0028\u0029",
            "name": "get_first_price_in_year",
            "summary": "",
            "url": "classes/Database.html#method_get_first_price_in_year"
        },                {
            "fqsen": "\\Database\u003A\u003Aget_prices_by_month_year_currency\u0028\u0029",
            "name": "get_prices_by_month_year_currency",
            "summary": "Retrieves\u0020all\u0020prices\u0020in\u0020month\u0020and\u0020year\u0020for\u0020given\u0020comodity\u0020in\u0020given\u0020currency",
            "url": "classes/Database.html#method_get_prices_by_month_year_currency"
        },                {
            "fqsen": "\\Database\u003A\u003Aget_nearest_price_date\u0028\u0029",
            "name": "get_nearest_price_date",
            "summary": "Get\u0020nearest\u0020price\u0020of\u0020comodity\u0020in\u0020given\u0020currency\u0020based\u0020on\u0020given\u0020date.\u0020Trying\u0020to\u0020find\u0020lower\u0020date\u0020first,\u0020if\u0020not\u0020successfull\u0020trying\u0020to\u0020find\u0020higher\u0020date",
            "url": "classes/Database.html#method_get_nearest_price_date"
        },                {
            "fqsen": "\\Database\u003A\u003Aget_last_update_date\u0028\u0029",
            "name": "get_last_update_date",
            "summary": "Retrieves\u0020last\u0020update\u0020date\u0020of\u0020given\u0020comodity",
            "url": "classes/Database.html#method_get_last_update_date"
        },                {
            "fqsen": "\\Database\u003A\u003Aget_ticker\u0028\u0029",
            "name": "get_ticker",
            "summary": "Retrieves\u0020ticker\u0020symbol\u0020of\u0020given\u0020comodity",
            "url": "classes/Database.html#method_get_ticker"
        },                {
            "fqsen": "\\Database\u003A\u003Aget_price_for_graph\u0028\u0029",
            "name": "get_price_for_graph",
            "summary": "Retrieves\u0020prices\u0020and\u0020price\u0020dates\u0020in\u0020given\u0020range",
            "url": "classes/Database.html#method_get_price_for_graph"
        },                {
            "fqsen": "\\Database\u003A\u003Acheck_if_data_exists\u0028\u0029",
            "name": "check_if_data_exists",
            "summary": "Checks\u0020if\u0020there\u0020is\u0020record\u0020for\u0020given\u0020comodity\u0020with\u0020given\u0020date",
            "url": "classes/Database.html#method_check_if_data_exists"
        },                {
            "fqsen": "\\Database\u003A\u003Aupdate_last_update_data\u0028\u0029",
            "name": "update_last_update_data",
            "summary": "Updates\u0020last\u0020update\u0020date\u0020of\u0020given\u0020comodity\u0020to\u0020given\u0020date",
            "url": "classes/Database.html#method_update_last_update_data"
        },                {
            "fqsen": "\\Database\u003A\u003Acheck_if_comodity_id_valid\u0028\u0029",
            "name": "check_if_comodity_id_valid",
            "summary": "Check\u0020if\u0020given\u0020ID\u0020of\u0020comodity\u0020is\u0020valid",
            "url": "classes/Database.html#method_check_if_comodity_id_valid"
        },                {
            "fqsen": "\\Database\u003A\u003Aget_comodities_with_ids\u0028\u0029",
            "name": "get_comodities_with_ids",
            "summary": "Retrieves\u0020all\u0020comodities\u0020with\u0020ids\u0020from\u0020database",
            "url": "classes/Database.html#method_get_comodities_with_ids"
        },                {
            "fqsen": "\\Database\u003A\u003Aget_newest_price\u0028\u0029",
            "name": "get_newest_price",
            "summary": "Retrieves\u0020latest\u0020price\u0020and\u0020price_date\u0020of\u0020given\u0020comodity",
            "url": "classes/Database.html#method_get_newest_price"
        },                {
            "fqsen": "\\Database\u003A\u003Aget_prices_for_AP_calculation\u0028\u0029",
            "name": "get_prices_for_AP_calculation",
            "summary": "Function\u0020that\u0020retrieves\u0020all\u0020prices\u0020for\u0020calculations\u0020of\u0020annualized\u0020performance\u0020table\u0020using\u0020CTE.",
            "url": "classes/Database.html#method_get_prices_for_AP_calculation"
        },                {
            "fqsen": "\\Database\u003A\u003Acheck_month\u0028\u0029",
            "name": "check_month",
            "summary": "Check\u0020if\u0020month\u0020is\u0020consistnet\u0020with\u0020expected\u0020month",
            "url": "classes/Database.html#method_check_month"
        },                {
            "fqsen": "\\Database\u003A\u003Aget_price_for_day\u0028\u0029",
            "name": "get_price_for_day",
            "summary": "Tries\u0020to\u0020find\u0020price\u0020with\u0020equal\u0020or\u0020greater\u0020date,\u0020if\u0020that\u0020fails\u0020tries\u0020to\u0020find\u0020price\u0020with\u0020lower\u0020date",
            "url": "classes/Database.html#method_get_price_for_day"
        },                {
            "fqsen": "\\Database\u003A\u003Aget_prices_in_interval\u0028\u0029",
            "name": "get_prices_in_interval",
            "summary": "Retrieves\u0020all\u0020prices\u0020from\u0020db,\u0020in\u0020given\u0020interval\u0020with\u0020given\u0020comodity_id\u0020and\u0020currency_id",
            "url": "classes/Database.html#method_get_prices_in_interval"
        },                {
            "fqsen": "\\Database\u003A\u003Aget_furthest_last_update_date\u0028\u0029",
            "name": "get_furthest_last_update_date",
            "summary": "Function\u0020to\u0020get\u0020the\u0020furthest\u0020date,\u0020on\u0020which\u0020one\u0020of\u0020the\u0020comodities\u0020was\u0020updated.",
            "url": "classes/Database.html#method_get_furthest_last_update_date"
        },                {
            "fqsen": "\\Database\u003A\u003Aget_conversion_rate_ticker\u0028\u0029",
            "name": "get_conversion_rate_ticker",
            "summary": "Function\u0020to\u0020get\u0020conversion\u0020rate\u0020ticker\u0020from\u0020table\u0020conversion_rates_tickers.",
            "url": "classes/Database.html#method_get_conversion_rate_ticker"
        },                {
            "fqsen": "\\Database\u003A\u003A\u0024logger",
            "name": "logger",
            "summary": "Needed\u0020only\u0020for\u0020debugging",
            "url": "classes/Database.html#property_logger"
        },                {
            "fqsen": "\\run_app\u0028\u0029",
            "name": "run_app",
            "summary": "CLI\u0020application\u0020to\u0020parse\u0020CSV\u0020to\u0020db.",
            "url": "namespaces/default.html#function_run_app"
        },                {
            "fqsen": "\\Logger",
            "name": "Logger",
            "summary": "Custom\u0020logger\u0020class.\u0020Mainly\u0020used\u0020in\u0020update\u0020script.",
            "url": "classes/Logger.html"
        },                {
            "fqsen": "\\Logger\u003A\u003A__construct\u0028\u0029",
            "name": "__construct",
            "summary": "",
            "url": "classes/Logger.html#method___construct"
        },                {
            "fqsen": "\\Logger\u003A\u003Alog\u0028\u0029",
            "name": "log",
            "summary": "",
            "url": "classes/Logger.html#method_log"
        },                {
            "fqsen": "\\Logger\u003A\u003Aclose\u0028\u0029",
            "name": "close",
            "summary": "Close\u0020log\u0020file\u0020stream",
            "url": "classes/Logger.html#method_close"
        },                {
            "fqsen": "\\Logger\u003A\u003A\u0024logFile",
            "name": "logFile",
            "summary": "",
            "url": "classes/Logger.html#property_logFile"
        },                {
            "fqsen": "\\Logger\u003A\u003A\u0024path",
            "name": "path",
            "summary": "",
            "url": "classes/Logger.html#property_path"
        },                {
            "fqsen": "\\Logger\u003A\u003A\u0024err",
            "name": "err",
            "summary": "",
            "url": "classes/Logger.html#property_err"
        },                {
            "fqsen": "\\TablesGenerator",
            "name": "TablesGenerator",
            "summary": "Class\u0020used\u0020to\u0020create\u0020datasets\u0020for\u0020AP\u0020tables.",
            "url": "classes/TablesGenerator.html"
        },                {
            "fqsen": "\\TablesGenerator\u003A\u003A__construct\u0028\u0029",
            "name": "__construct",
            "summary": "",
            "url": "classes/TablesGenerator.html#method___construct"
        },                {
            "fqsen": "\\TablesGenerator\u003A\u003Acalculate_percent_of_price\u0028\u0029",
            "name": "calculate_percent_of_price",
            "summary": "Function\u0020to\u0020calculate\u0020percentage\u0020of\u0020given\u0020price.\u0020Absolute\u0020value\u0020of\u0020price\u0020is\u0020used.",
            "url": "classes/TablesGenerator.html#method_calculate_percent_of_price"
        },                {
            "fqsen": "\\TablesGenerator\u003A\u003Aget_calculation_for_AP_table\u0028\u0029",
            "name": "get_calculation_for_AP_table",
            "summary": "Function\u0020to\u0020get\u0020all\u0020values\u0020for\u0020AP\u0020table.",
            "url": "classes/TablesGenerator.html#method_get_calculation_for_AP_table"
        },                {
            "fqsen": "\\TablesGenerator\u003A\u003A\u0024tableBuilder",
            "name": "tableBuilder",
            "summary": "",
            "url": "classes/TablesGenerator.html#property_tableBuilder"
        },                {
            "fqsen": "\\",
            "name": "\\",
            "summary": "",
            "url": "namespaces/default.html"
        }            ]
);
