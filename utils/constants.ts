export const pricingPlans=[
    {
        name:'Basic',
        price:9,
        description:'Perfect for occasional use',
        items:[
            '5 pdf summaries per month',
            '24/7 chat support',
        ],
        id:'basic',
        paymentLink: process.env.NODE_ENV === 'development' 
        ?'https://buy.stripe.com/test_fZu7sEbdTf7j0dW3EBfIs00'
        :'',
        priceId: process.env.NODE_ENV==='development'?
        'price_1RYn9s4ImleVkGMQAUV1I4kk'
        :'',
        
    },

    {
        name:'Pro',
        price:19,
        description:'Perfect for professionals and teams',
        items:[
            'Unlimited pdf summaries per month',
            '24/7 chat support',
            'Priority processing',
        ],
        id:'pro',
        paymentLink:process.env.NODE_ENV === 'development' 
        ?'https://buy.stripe.com/test_3cIdR2dm15wJ6CkfnjfIs01'
        :'',
        priceId:process.env.NODE_ENV === 'development' 
        ?'price_1RYn9s4ImleVkGMQrQdIKNwU':''
    },
];