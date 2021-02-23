import { el, mount, setChildren } from "https://redom.js.org/redom.es.min.js";

class App {
    constructor() {
        this.data = {
            initialInvestment: 1000,
            contributionFrequency: 7,
            contributionAmount: 50,
            averageInterestRate: 5,
            value50Year: [],
        };

        this.el = el("form", 
            el("label", "Initial investment", 
                this.initialInvestment = el("input", { type: "number" }),
            ),
            el("label", "Contribution frequency", 
                this.contributionFrequency = el("select",
                    el("option", "Daily", { value: 1 }),
                    el("option", "Weekly", { value: 7 }),
                    el("option", "Fortnightly", { value: 14 }),
                    el("option", "Monthly", { value: 365 }),
                ),
            ),
            el("label", "Contribution amount", 
                this.contributionAmount = el("input", { type: "number" }),
            ),
            el("label", "Average annual interest rate", 
                this.averageInterestRate = el("input", { type: "number" }),
            ),
            this.value50YearList = el("table"),
            {
                style: `
                    display: flex;
                    flex-direction: column;
                `
            },
        );

        this.value50YearList.update = (values) => {
            setChildren(this.value50YearList);
            mount(this.value50YearList, el("tr", el("th", "year"), el("th", "networth")));
            values.forEach((val, i) => {
                mount(this.value50YearList, el("tr", el("td", i+1), el("td", val)));
            })
        };

        this.update(this.data);

        // Update on field changes
        ["initialInvestment", "contributionFrequency", "contributionAmount", "averageInterestRate"].forEach(key => {
            this[key].addEventListener("change", (e) => {
                this.update({ ...this.data, [key]: e.target.value })
            });
        });
    }
    
    update(data) {
        data.initialInvestment = Number(data.initialInvestment);
        data.contributionFrequency = Number(data.contributionFrequency);
        data.contributionAmount = Number(data.contributionAmount);
        data.averageInterestRate = Number(data.averageInterestRate);

        this.initialInvestment.value = data.initialInvestment;
        this.contributionFrequency.value = data.contributionFrequency;
        this.contributionAmount.value = data.contributionAmount;
        this.averageInterestRate.value = data.averageInterestRate;
        this.value50YearList.update(this.calculate50YearValues(data));

        this.data = data;
    }

    calculate50YearValues(data) {
        const values = [];
        const dailyFactor = Math.exp(Math.log(1+data.averageInterestRate/100) / 365);
        let networth = data.initialInvestment;
        for (let i = 1; i <= 365*50; i++) {
            networth *= dailyFactor;
            if (i % data.contributionFrequency == 0) {
                networth += data.contributionAmount;
            }
            if (i % 365 == 0) {
                const money = networth.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
                values.push(money)
            }
        }
        return values;
    }
}

mount(document.body, new App());
