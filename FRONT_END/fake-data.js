// ========================================
// FAKE DATABASE
// Temporary frontend data for development
// ========================================


// ----------------------------------------
// USERS
// ----------------------------------------

const users = [
    {
        employeeCode: "EMP001",
        password: "user123",
        name: "Ali Khan"
    },

    {
        employeeCode: "EMP002",
        password: "user456",
        name: "Ahmed Ali"
    }
];


// ----------------------------------------
// ADMIN
// ----------------------------------------

const admin = {
    password: "admin123"
};


// ----------------------------------------
// TICKETS
// ----------------------------------------

const tickets = [

    // USER 1 - PENDING
    {
        ticketId: 1001,
        employeeCode: "EMP001",
        category: "Network",
        description: "My laptop cannot connect to the office Wi-Fi.",

        attachment: null,

        status: "pending",

        createdAt: "2026-08-29T09:30:00",
        resolvedAt: null
    },


    // USER 1 - PENDING
    {
        ticketId: 1002,
        employeeCode: "EMP001",
        category: "Hardware",
        description: "My laptop charger is not charging the battery properly.",

        attachment: "charger_issue.jpg",

        status: "pending",

        createdAt: "2026-08-30T14:15:00",
        resolvedAt: null
    },


    // USER 1 - RESOLVED
    {
        ticketId: 1003,
        employeeCode: "EMP001",
        category: "Software",
        description: "Microsoft Outlook was not opening.",

        attachment: null,

        status: "resolved",

        createdAt: "2026-08-25T10:00:00",
        resolvedAt: "2026-08-26T13:45:00"
    },


    // USER 2 - PENDING
    {
        ticketId: 1004,
        employeeCode: "EMP002",
        category: "Account / Access",
        description: "I cannot log into the company VPN.",

        attachment: null,

        status: "pending",

        createdAt: "2026-08-30T11:20:00",
        resolvedAt: null
    },


    // USER 2 - RESOLVED
    {
        ticketId: 1005,
        employeeCode: "EMP002",
        category: "Network",
        description: "My Ethernet connection was not working.",

        attachment: "ethernet_problem.png",

        status: "resolved",

        createdAt: "2026-08-20T08:40:00",
        resolvedAt: "2026-08-20T12:30:00"
    }
];


// ----------------------------------------
// COMMENTS
// ----------------------------------------

const comments = [

    // Conversation on Ticket #1001

    {
        commentId: 1,

        ticketId: 1001,

        sender: "admin",

        message: "Please restart your laptop and try connecting again.",

        createdAt: "2026-08-29T10:00:00"
    },

    {
        commentId: 2,

        ticketId: 1001,

        sender: "user",

        message: "I restarted it, but I still cannot connect.",

        createdAt: "2026-08-29T10:20:00"
    },


    // Conversation on Ticket #1002

    {
        commentId: 3,

        ticketId: 1002,

        sender: "admin",

        message: "Please bring the laptop to the IT department for inspection.",

        createdAt: "2026-08-30T15:00:00"
    },


    // Conversation on Ticket #1003

    {
        commentId: 4,

        ticketId: 1003,

        sender: "admin",

        message: "Outlook was repaired and is now working correctly.",

        createdAt: "2026-08-26T13:40:00"
    },


    // Conversation on Ticket #1004

    {
        commentId: 5,

        ticketId: 1004,

        sender: "admin",

        message: "We are checking your VPN permissions.",

        createdAt: "2026-08-30T12:00:00"
    }
];


// ----------------------------------------
// NOTIFICATIONS
// ----------------------------------------

const notifications = [

    // USER 1

    {
        notificationId: 1,

        employeeCode: "EMP001",

        ticketId: 1001,

        type: "new_comment",

        message: "An admin responded to your Ticket #1001.",

        createdAt: "2026-08-29T10:00:00"
    },


    {
        notificationId: 2,

        employeeCode: "EMP001",

        ticketId: 1003,

        type: "ticket_resolved",

        message: "Your Ticket #1003 has been resolved.",

        createdAt: "2026-08-26T13:45:00"
    },


    // USER 2

    {
        notificationId: 3,

        employeeCode: "EMP002",

        ticketId: 1004,

        type: "new_comment",

        message: "An admin responded to your Ticket #1004.",

        createdAt: "2026-08-30T12:00:00"
    },


    {
        notificationId: 4,

        employeeCode: "EMP002",

        ticketId: 1005,

        type: "ticket_resolved",

        message: "Your Ticket #1005 has been resolved.",

        createdAt: "2026-08-20T12:30:00"
    }
];