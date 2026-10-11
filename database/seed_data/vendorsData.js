
const vendorsData = [
    {
        name: "Microsoft",
        function: "Cloud infrastructure, identity and productivity",
        criticality: "critical",
        holds_pii: true,
        system_access: true,
        it_supplier: true
    },
    {
        name: "ANS Group",
        function: "Managed security services and SOC monitoring",
        criticality: "critical",
        holds_pii: true,
        system_access: true,
        it_supplier: true
    },
    {
        name: "Capita",
        function: "Customer contact centre services",
        criticality: "high",
        holds_pii: true,
        system_access: true,
        it_supplier: false
    },
    {
        name: "Office Furniture Ltd",
        function: "Office furniture and equipment",
        criticality: "low",
        holds_pii: false,
        system_access: false,
        it_supplier: false
    },
    {
        name: "Cloudflare",
        function: "DNS, web security and traffic filtering",
        criticality: "high",
        holds_pii: false,
        system_access: true,
        it_supplier: true
    },
    {
        name: "Payroll Services Ltd",
        function: "Employee payroll processing",
        criticality: "high",
        holds_pii: true,
        system_access: true,
        it_supplier: false
    },
    {
        name: "External Audit Partners",
        function: "Financial and compliance auditing",
        criticality: "medium",
        holds_pii: true,
        system_access: false,
        it_supplier: false
    },
    {
        name: "Training Provider Ltd",
        function: "Staff training and development",
        criticality: "low",
        holds_pii: false,
        system_access: false,
        it_supplier: false
    }
];

module.exports = vendorsData;
