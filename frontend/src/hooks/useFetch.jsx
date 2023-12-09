
import { useEffect, useState } from "react";
import axios from 'axios'

axios.defaults.baseURL = process.env.REACT_APP_BACKEND_DOMAIN


const useFetch = (query) => {

    const [ getData, setData ] = useState({
        isLoading: false,
        apiData: undefined,
        status: null,
        serverError: null
    })

    useEffect(() => {

        if(!query) return

        const fetchData = async () => {
            try {
                setData((prev) => ({...prev, isLoading: true}))

                const { data, status } = await axios.get(`/api/${query}`)

                if(status === 201){
                    setData((prev) => ({...prev, isLoading: false}))
                    setData((prev) => ({...prev, apiData: data, status: status}))
                }
                setData((prev) => ({...prev, isLoading: false}))
                
            } catch (error) {
                setData((prev) => ({...prev, isLoading: false}))
                setData((prev) => ({...prev, serverError: error}))
            }
        }

        fetchData()

    }, [query])

  return [ getData, setData]
}

export default useFetch