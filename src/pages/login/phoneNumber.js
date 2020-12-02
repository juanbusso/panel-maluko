
function validatePhoneNumber(phone) {
    let newPhone = phone;
    phone=phone.replace(/[^0-9.]/g, "");
    if(newPhone.length>phoneLength&&newPhone.length>5) {
        newPhone = fixPhone(phone);
    }
    phoneLength = newPhone.length;
//let regex = /^(?:(?:(?:00|\+)54(\s?9)?\s?)|0)?(?:11\s?(?:15\s?)?|[2368]\d)\d\s?\d{3}\s?\d{4}$/;
    let regex = /^(?:11\s?(?:15\s?)?|[2368]\d)\d\s?\d{3}\s?\d{4}$/;
    return regex.test(phone);
};

let codigosDeArea = [11,220,221,223,230,236,237,249,260,261,263,264,266,280,291,294,297,298,299,343,345,348,351,353,358,362,364,370,376,379,380,381,383,385,387,388,2202,2221,2223,2224,2225,2226,2227,2229,2241,2242,2243,2244,2245,2246,2252,2254,2255,2257,2261,2262,2264,2265,2266,2267,2268,2271,2272,2273,2274,2281,2283,2284,2285,2286,2291,2292,2296,2297,2302,2314,2316,2317,2320,2323,2324,2325,2326,2331,2333,2334,2335,2336,2337,2338,2342,2343,2344,2345,2346,2352,2353,2354,2355,2356,2357,2358,2392,2393,2394,2395,2396,2473,2474,2475,2477,2478,2622,2624,2625,2626,2646,2647,2648,2651,2652,2655,2656,2657,2658,2901,2902,2903,2920,2921,2922,2923,2924,2925,2926,2927,2928,2929,2931,2932,2933,2934,2935,2936,2940,2942,2945,2946,2948,2952,2953,2954,2962,2963,2964,2966,2972,2982,2983,3327,3329,3382,3385,3387,3388,3400,3401,3402,3404,3405,3406,3407,3408,3409,3435,3436,3437,3438,3442,3444,3445,3446,3447,3454,3455,3456,3458,3460,3462,3463,3464,3465,3466,3467,3468,3469,3471,3472,3476,3482,3483,3487,3489,3491,3492,3493,3496,3497,3498,3521,3522,3524,3525,3532,3533,3537,3541,3542,3543,3544,3546,3547,3548,3549,3562,3563,3564,3571,3572,3573,3574,3575,3576,3582,3583,3584,3585,3711,3715,3716,3718,3721,3725,3731,3734,3735,3741,3743,3751,3754,3755,3756,3757,3758,3772,3773,3774,3775,3777,3781,3782,3786,3821,3825,3826,3827,3832,3835,3837,3838,3841,3843,3844,3845,3846,3854,3855,3856,3857,3858,3861,3862,3863,3865,3867,3868,3869,3873,3876,3877,3878,3885,3886,3887,3888,3891,3892,3894];

let phoneLength = 0;

function fixPhone(phone) {
    if(phone.substring(0,3)==="549")phone=phone.substring(3,phone.length);
    if(phone.substring(0,2)==="54")phone=phone.substring(2,phone.length);
    if(phone.substring(0,4)==="1115") return "("+phone.substring(0,2)+") "+phone.substring(2,4)+" "+phone.substring(4,8)+(phone.length>8?("-"+phone.substring(8,phone.length)):"");
    if(phone.length>6)phone=phone.substring(0,6)+"-"+phone.substring(6,phone.length+1);
    if (phone.substring(0,1)==="0") phone = phone.substring(1,phone.length);
    if (codigosDeArea.includes(Number(phone.substring(0,4))) ) return "("+phone.substring(0,4)+") "+phone.substring(4,phone.length);
    if (codigosDeArea.includes(Number(phone.substring(0,3))) ) return "("+phone.substring(0,3)+") "+phone.substring(3,phone.length);
    if (codigosDeArea.includes(Number(phone.substring(0,2))) ) return "("+phone.substring(0,2)+") "+phone.substring(2,phone.length);
    return phone;
}


function phoneNumberFix(number){
    if (!number) return '';
    number=number.replace(/[^0-9.]/g, "");
    number = fixPhone(number);
    number=number.replace(/[^0-9.]/g, "");
    number = number.replace(/\s/gi, "");
    if (number.length > 10) number = '11'+number.substring(4,12);
    number = '+549'+number;
    return number;
};

export { phoneNumberFix, validatePhoneNumber }
