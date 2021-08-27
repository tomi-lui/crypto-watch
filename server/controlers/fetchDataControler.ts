import { client } from "../apollo"
import { useFetchedTokenDatas } from "../data/tokens/tokenData"
import web3 from "web3"
import { useFetchTokenPriceData } from "../data/tokens/priceData"

export const tokenDatas = async ( req: any , res ) => {

    if (!req.body.addresses) {
        return res.send("ERROR: no address received")
    }

    // error handling for invalid arguments
    const validAdrs: string[] = []
    const invalidAdrs: string[] = []
    req.body.addresses.forEach( address => {
        if (web3.utils.isAddress(address)) {
            validAdrs.push(address)
        } else {
            invalidAdrs.push(address)
        }
    })
    
    // fetch token datas
    await useFetchedTokenDatas( validAdrs, client )
    .then( tokenDatas => {
        let result = { addresses: {valid: validAdrs, invalid: invalidAdrs} , tokenDatas }
        res.send(result)
        .catch( error => {
            res.send(error)
        })
    })
}

export const tokenPriceData = async (req: any, res ) => {

    if (!req.body.address) {
        return res.send("ERROR: invalid address")
    }

    const adrs: string = req.body.address

    // fetch token prices
    await useFetchTokenPriceData(adrs, client)
    .then( data => {
        res.send( { data })
    })
    .catch( error => {
        res.send(error)
    })
}