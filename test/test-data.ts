export const filter1 = {
    filterType: "AND",
    conditions: [
        {
            id: "followers_count",
            operator: "GT",
            value: 3000
        },
        {
            id: "friends_count",
            operator: "LT",
            value: 10
        }
    ]
}

export const filter2 = {
    filterType: "AND",
    conditions: [
        {
            id: "followers_count",
            operator: "GT",
            value: 3000
        },
        {
            id: "friends_count",
            operator: "LT",
            value: 400
        }
    ]
}

export const filter4 = {
    filterType: "AND",
    conditions: [
        {
            id: "location",
            operator: "CONTAINS",
            value: "Chennai"
        }
    ]
}