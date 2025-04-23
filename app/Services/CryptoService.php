<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache; // Still useful if you add caching later
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Client\RequestException;

class CryptoService
{
    protected $baseUrl = 'https://data-api.coindesk.com/asset/v1/top/list';

    /**
     * Get simplified cryptocurrency listings (symbol, name, logo, price) from CoinDesk API.
     *
     * Fetches data from the API, extracts relevant fields, and returns them.
     *
     * @param int $page Page number to fetch.
     * @param int $pageSize Number of results per page.
     * @param string $sortBy Field to sort by.
     * @param string $sortDirection Sort direction (ASC or DESC).
     * @param string $groups Comma-separated list of data groups to include (must include ID, BASIC, PRICE for this extraction).
     * @param string $quoteAsset The quote asset for price data (e.g., USD).
     * @return array|null Returns an array of simplified crypto data, or null on failure or if data is malformed.
     * Each element in the array will have 'symbol', 'name', 'logo_url', 'price_usd'.
     */
    public function getLatestListings(
        int $page = 1,
        int $pageSize = 10,
        string $sortBy = 'CIRCULATING_MKT_CAP_USD',
        string $sortDirection = 'DESC',
        // Ensure required groups are requested if relying on specific fields
        string $groups = 'ID,BASIC,PRICE',
        string $quoteAsset = 'USD'
    ): ?array {

        $queryParams = [
            'page' => $page,
            'page_size' => $pageSize,
            'sort_by' => $sortBy,
            'sort_direction' => $sortDirection,
            'groups' => $groups,
            'toplist_quote_asset' => $quoteAsset,
        ];

        try {
            $response = Http::get($this->baseUrl, $queryParams);

            if ($response->successful()) {
                $apiResponse = $response->json(); // Get the full response body as an array

                // --- Start Data Extraction ---
                $extractedCryptos = []; // Initialize an empty array for results

                // Check if the necessary keys exist and 'LIST' is an array
                if (isset($apiResponse['Data']['LIST']) && is_array($apiResponse['Data']['LIST'])) {
                    // Loop through each item in the 'LIST' array
                    foreach ($apiResponse['Data']['LIST'] as $cryptoItem) {
                        // Check if the required keys exist in the current item
                        if (isset($cryptoItem['SYMBOL'], $cryptoItem['NAME'], $cryptoItem['LOGO_URL'], $cryptoItem['PRICE_USD'])) {
                            // Create a new associative array with only the desired fields
                            $extractedCryptos[] = [
                                'symbol' => $cryptoItem['SYMBOL'],
                                'name' => $cryptoItem['NAME'],
                                'logo_url' => $cryptoItem['LOGO_URL'],
                                // Consider casting price to float if needed later
                                'price_usd' => $cryptoItem['PRICE_USD'],
                            ];
                        } else {
                             Log::warning('Crypto item missing expected keys in API response', [
                                 'item_keys' => array_keys($cryptoItem), // Log available keys for debugging
                                 'required_keys' => ['SYMBOL', 'NAME', 'LOGO_URL', 'PRICE_USD']
                                ]);
                            // Decide if you want to skip this item or handle it differently
                        }
                    }
                    // Return the array of extracted data
                    return $extractedCryptos;

                } else {
                    // Log an error if the expected structure isn't found in the successful response
                    Log::error('CoinDesk API response structure mismatch: Data.LIST not found or not an array.', [
                        'url' => $this->baseUrl,
                        'params' => $queryParams,
                        'response_keys' => isset($apiResponse['Data']) ? array_keys($apiResponse['Data']) : 'Data key missing',
                    ]);
                    return null; // Indicate failure due to unexpected structure
                }
                // --- End Data Extraction ---

            } else {
                // Log the error if the HTTP request itself failed
                Log::error('Failed to fetch crypto listings from CoinDesk API', [
                    'url' => $this->baseUrl,
                    'params' => $queryParams,
                    'status' => $response->status(),
                    'body' => $response->body(), // Log raw body for debugging API errors
                ]);
                // $response->throw(); // Alternatively, throw an exception
                return null; // Indicate failure
            }
        } catch (RequestException $e) {
            // Handle exceptions during the HTTP request (e.g., connection errors)
            Log::error('HTTP Request Exception while fetching crypto listings', [
                'message' => $e->getMessage(),
                'url' => $this->baseUrl,
                'params' => $queryParams,
            ]);
            return null; // Indicate failure
        } catch (\Exception $e) {
            // Catch any other unexpected errors during processing
            Log::error('Unexpected error in CryptoService::getLatestListings', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(), // Add trace for better debugging
            ]);
            return null; // Indicate failure
        }
    }
}