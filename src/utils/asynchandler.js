// const asynchandler=(requestHandler)=>{
//     (req,res,next)=>{
//         Promise.resolve(
//             requestHandler(req,res,next)
//         ).catch((err)=>next(err))
//     }
// }

const asynchandler=(requestHandler)=>{
    (req,res,next)=>{
        Promise
        .resolve(
            requestHandler(req,res,next) //execute requestHandler
        )
        .catch((err)=>{next(err)})
    }
}

export {asynchandler}


// const asynchandler=(fn)=>async(res,req,next)=>{
//     try {
            // await fn(req,res,next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success:false,
//             message:error.message
//         })
//     }
// }