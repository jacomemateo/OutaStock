import http from 'k6/http';
import { check, sleep } from 'k6';

// 1. Define interfaces to resolve property access errors
interface LoginResponse {
    accessToken: string;
}

interface CountResponse {
    count: number;
}

interface TransactionsEnvelope {
    items: unknown[];
    total: number;
}

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

// creds from env
const EMAIL = __ENV.EMAIL || '';
const PASSWORD = __ENV.PASSWORD || '';

export const options = {
    scenarios: {
        browse: {
            executor: 'ramping-vus',
            startVUs: 1,
            stages: [
                { duration: '10s', target: 5 },
                { duration: '10s', target: 10 },
                { duration: '10s', target: 0 },
            ],
            gracefulRampDown: '30s',
        },
    },
    thresholds: {
        http_req_duration: ['p(95)<300'],
        http_req_failed: ['rate<0.01'],
    },
};

function login(): string {
    const res = http.post(
        `${BASE_URL}/api/auth/login`,
        JSON.stringify({
            email: EMAIL,
            password: PASSWORD,
        }),
        {
            headers: { 'Content-Type': 'application/json' },
        },
    );

    check(res, {
        'login status 200': (r) => r.status === 200,
    });

    // 2. FIX: Cast res.json() to our interface to solve "'body' is possibly 'null'"
    // and "Property 'accessToken' does not exist" errors.
    const body = res.json() as unknown as LoginResponse;

    if (!body || !body.accessToken) {
        throw new Error('Login failed: Response body or accessToken is missing');
    }

    return body.accessToken;
}

function isTransactionsEnvelope(data: unknown): data is TransactionsEnvelope {
    if (!data || typeof data !== 'object') {
        return false;
    }

    const envelope = data as TransactionsEnvelope;
    return Array.isArray(envelope.items) && typeof envelope.total === 'number';
}

export default function () {
    const token = login();

    const authHeaders = {
        Authorization: `Bearer ${token}`,
    };

    // --- PAGE 0 ---
    const page0 = http.get(
        `${BASE_URL}/api/transactions/?num_rows=20&page_offset=0&sort_by=date&sort_dir=desc`,
        { headers: authHeaders },
    );

    check(page0, {
        'status 200 (page 0)': (r) => r.status === 200,
        'page 0 has envelope': (r) => isTransactionsEnvelope(r.json()),
    });

    // --- PAGE 10 ---
    const page10 = http.get(
        `${BASE_URL}/api/transactions/?num_rows=20&page_offset=10&sort_by=date&sort_dir=desc`,
        { headers: authHeaders },
    );

    check(page10, {
        'status 200 (page 10)': (r) => r.status === 200,
        'page 10 has envelope': (r) => isTransactionsEnvelope(r.json()),
    });

    // --- PAGE 50 ---
    const page50 = http.get(
        `${BASE_URL}/api/transactions/?num_rows=20&page_offset=50&sort_by=date&sort_dir=desc`,
        { headers: authHeaders },
    );

    check(page50, {
        'status 200 (page 50)': (r) => r.status === 200,
        'page 50 has envelope': (r) => isTransactionsEnvelope(r.json()),
    });

    // --- COUNT ---
    const countRes = http.get(`${BASE_URL}/api/transactions/count`, {
        headers: authHeaders,
    });

    check(countRes, {
        'count status 200': (r) => r.status === 200,
        'count is number': (r) => {
            const data = r.json();
            // 3. FIX: Safely check for the 'count' property using type casting
            if (typeof data === 'number') return true;
            const countObj = data as unknown as CountResponse;
            return countObj && typeof countObj.count === 'number';
        },
    });

    // --- SEARCH ---
    const searchRes = http.get(
        `${BASE_URL}/api/transactions/?num_rows=20&page_offset=0&search=test&sort_by=date&sort_dir=desc`,
        { headers: authHeaders },
    );

    check(searchRes, {
        'search status 200': (r) => r.status === 200,
        'search returns envelope': (r) => isTransactionsEnvelope(r.json()),
    });

    sleep(1);
}
