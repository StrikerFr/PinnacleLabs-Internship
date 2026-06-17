// Mock Supabase Client for client-side demo execution
import type { Database } from "./types";

// Setup Mock database store with localStorage persistence
const isClient = typeof window !== "undefined";

const getLocalStorage = (key: string, defaultVal: any) => {
  if (!isClient) return defaultVal;
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
};

const setLocalStorage = (key: string, val: any) => {
  if (!isClient) return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    // ignore
  }
};

// Seed mock data
const INITIAL_COUPONS = [
  {
    id: "c1",
    code: "STAY10",
    discount_type: "percentage",
    discount_value: 10,
    active: true,
    used_count: 5,
    max_uses: 100,
    expires_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "c2",
    code: "SAVE50",
    discount_type: "flat",
    discount_value: 50,
    active: true,
    used_count: 12,
    max_uses: 200,
    expires_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "c3",
    code: "SAVE75",
    discount_type: "flat",
    discount_value: 75,
    active: true,
    used_count: 8,
    max_uses: 150,
    expires_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "c4",
    code: "SAVE100",
    discount_type: "flat",
    discount_value: 100,
    active: true,
    used_count: 3,
    max_uses: 50,
    expires_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_ORDERS = [
  {
    id: "o1",
    order_number: "VG-1004",
    user_id: "mock-user-id",
    customer_name: "Priya Sharma",
    customer_email: "priya@example.com",
    customer_phone: "9876543210",
    shipping_address: {
      full_name: "Priya Sharma",
      phone: "9876543210",
      line1: "Apt 402, Green Glen",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560103",
      country: "India",
    },
    subtotal: 799,
    discount: 0,
    shipping: 0,
    total: 799,
    coupon_id: null,
    coupon_code: null,
    payment_method: "cod",
    payment_status: "paid",
    status: "delivered",
    notes: "Please leave package with security",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    order_items: [
      {
        id: "oi1",
        order_id: "o1",
        product_sku: "VG-STARTER-2",
        product_name: "VedaGlows Starter Kit — 2 Pack",
        quantity: 1,
        unit_price: 799,
        line_total: 799,
      },
    ],
  },
  {
    id: "o2",
    order_number: "VG-1003",
    user_id: "mock-user-id",
    customer_name: "Arjun Mehta",
    customer_email: "arjun@example.com",
    customer_phone: "9123456789",
    shipping_address: {
      full_name: "Arjun Mehta",
      phone: "9123456789",
      line1: "Flat 12B, Sky Heights",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      country: "India",
    },
    subtotal: 499,
    discount: 0,
    shipping: 0,
    total: 499,
    coupon_id: null,
    coupon_code: null,
    payment_method: "online",
    payment_status: "paid",
    status: "shipped",
    notes: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), // 4 days ago
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    order_items: [
      {
        id: "oi2",
        order_id: "o2",
        product_sku: "VG-STARTER-1",
        product_name: "VedaGlows Starter Kit",
        quantity: 1,
        unit_price: 499,
        line_total: 499,
      },
    ],
  },
  {
    id: "o3",
    order_number: "VG-1002",
    user_id: "mock-user-id-2",
    customer_name: "Meera Reddy",
    customer_email: "meera@example.com",
    customer_phone: "8765432109",
    shipping_address: {
      full_name: "Meera Reddy",
      phone: "8765432109",
      line1: "Plot 45, Jubilee Hills",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500033",
      country: "India",
    },
    subtotal: 1099,
    discount: 50,
    shipping: 0,
    total: 1049,
    coupon_id: "c2",
    coupon_code: "SAVE50",
    payment_method: "online",
    payment_status: "paid",
    status: "confirmed",
    notes: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    order_items: [
      {
        id: "oi3",
        order_id: "o3",
        product_sku: "VG-STARTER-3",
        product_name: "VedaGlows Starter Kit — 3 Pack",
        quantity: 1,
        unit_price: 1099,
        line_total: 1099,
      },
    ],
  },
  {
    id: "o4",
    order_number: "VG-1001",
    user_id: "mock-user-id",
    customer_name: "Aanya Kapoor",
    customer_email: "aanya@example.com",
    customer_phone: "7654321098",
    shipping_address: {
      full_name: "Aanya Kapoor",
      phone: "7654321098",
      line1: "House 28, Sector 15",
      city: "Noida",
      state: "Uttar Pradesh",
      pincode: "201301",
      country: "India",
    },
    subtotal: 799,
    discount: 0,
    shipping: 0,
    total: 799,
    coupon_id: null,
    coupon_code: null,
    payment_method: "cod",
    payment_status: "pending",
    status: "processing",
    notes: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    order_items: [
      {
        id: "oi4",
        order_id: "o4",
        product_sku: "VG-STARTER-2",
        product_name: "VedaGlows Starter Kit — 2 Pack",
        quantity: 1,
        unit_price: 799,
        line_total: 799,
      },
    ],
  },
  {
    id: "o5",
    order_number: "VG-1000",
    user_id: "mock-user-id-3",
    customer_name: "Riya Trivedi",
    customer_email: "riya@example.com",
    customer_phone: "6543210987",
    shipping_address: {
      full_name: "Riya Trivedi",
      phone: "6543210987",
      line1: "Apt 901, Pearl Crest",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411001",
      country: "India",
    },
    subtotal: 499,
    discount: 30,
    shipping: 0,
    total: 469,
    coupon_id: null,
    coupon_code: "STAY10",
    payment_method: "cod",
    payment_status: "failed",
    status: "cancelled",
    notes: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    order_items: [
      {
        id: "oi5",
        order_id: "o5",
        product_sku: "VG-STARTER-1",
        product_name: "VedaGlows Starter Kit",
        quantity: 1,
        unit_price: 499,
        line_total: 499,
      },
    ],
  },
];

const INITIAL_PROFILE = {
  id: "mock-user-id",
  email: "demo@vedaglows.com",
  full_name: "Demo User",
  phone: "+91 99999 99999",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const INITIAL_STORE_SETTINGS = {
  id: "singleton",
  store_name: "VedaGlows",
  logo_url: "/assets/vedaglows-logo.png",
  support_email: "vedaglows@gmail.com",
  shipping_charge: 0,
  cod_enabled: true,
  razorpay_key_id: "mock_key_id",
  social_instagram: "vedaglows",
  social_facebook: null,
  social_youtube: null,
  social_twitter: null,
};

const INITIAL_PRODUCT_OVERRIDES = [
  {
    sku: "VG-STARTER-1",
    name: "VedaGlows Starter Kit",
    description: "28-Day Skin Reset — Daily Clean, Glow Repair, Deep Detox",
    price: 499,
    mrp: 1299,
    stock: 45,
    visible: true,
    enabled: true,
    image_url: null,
  },
  {
    sku: "VG-STARTER-2",
    name: "VedaGlows Starter Kit — 2 Pack",
    description: "Two 28-Day Resets. Better value.",
    price: 799,
    mrp: 2598,
    stock: 32,
    visible: true,
    enabled: true,
    image_url: null,
  },
  {
    sku: "VG-STARTER-3",
    name: "VedaGlows Starter Kit — 3 Pack",
    description: "Three 28-Day Resets. Maximum savings.",
    price: 1099,
    mrp: 3897,
    stock: 15,
    visible: true,
    enabled: true,
    image_url: null,
  },
];

// Global variables for server-side memory retention
let dbCoupons = getLocalStorage("vedaglows-coupons", INITIAL_COUPONS);
let dbOrders = getLocalStorage("vedaglows-orders", INITIAL_ORDERS);
let dbProfile = getLocalStorage("vedaglows-profile", INITIAL_PROFILE);
let dbStoreSettings = getLocalStorage("vedaglows-store-settings", INITIAL_STORE_SETTINGS);
let dbProductOverrides = getLocalStorage("vedaglows-product-overrides", INITIAL_PRODUCT_OVERRIDES);
let dbSession = getLocalStorage("vedaglows-session", {
  access_token: "mock-access-token",
  user: {
    id: "mock-user-id",
    email: "demo@vedaglows.com",
    user_metadata: { full_name: "Demo User" },
  },
});

// DB initialization functions
export const getMockCoupons = () => dbCoupons;
export const setMockCoupons = (val: any) => {
  dbCoupons = val;
  setLocalStorage("vedaglows-coupons", val);
};
export const getMockOrders = () => dbOrders;
export const setMockOrders = (val: any) => {
  dbOrders = val;
  setLocalStorage("vedaglows-orders", val);
};
export const getMockProfile = () => dbProfile;
export const setMockProfile = (val: any) => {
  dbProfile = val;
  setLocalStorage("vedaglows-profile", val);
};
export const getMockStoreSettings = () => dbStoreSettings;
export const setMockStoreSettings = (val: any) => {
  dbStoreSettings = val;
  setLocalStorage("vedaglows-store-settings", val);
};
export const getMockProductOverrides = () => dbProductOverrides;
export const setMockProductOverrides = (val: any) => {
  dbProductOverrides = val;
  setLocalStorage("vedaglows-product-overrides", val);
};
export const getMockSession = () => dbSession;
export const setMockSession = (val: any) => {
  dbSession = val;
  setLocalStorage("vedaglows-session", val);
};

// Global list of auth callbacks
const authCallbacks: Array<(event: string, session: any) => void> = [];

export const mockSupabaseClient = {
  auth: {
    async getSession() {
      const session = getMockSession();
      return { data: { session }, error: null };
    },
    async getUser() {
      const session = getMockSession();
      return { data: { user: session ? session.user : null }, error: null };
    },
    async getClaims(token: string) {
      return {
        data: { claims: { sub: "mock-user-id", email: "demo@vedaglows.com" } },
        error: null,
      };
    },
    onAuthStateChange(callback: (event: string, session: any) => void) {
      authCallbacks.push(callback);
      const session = getMockSession();
      // Invoke immediately
      setTimeout(() => callback("SIGNED_IN", session), 0);
      return {
        data: {
          subscription: {
            unsubscribe() {
              const idx = authCallbacks.indexOf(callback);
              if (idx >= 0) authCallbacks.splice(idx, 1);
            },
          },
        },
      };
    },
    async signInWithPassword({ email, password }: { email: string; password?: string }) {
      const mockSession = {
        access_token: "mock-access-token",
        user: {
          id: "mock-user-id",
          email: email || "demo@vedaglows.com",
          user_metadata: { full_name: "Demo User" },
        },
      };
      setMockSession(mockSession);
      authCallbacks.forEach((cb) => cb("SIGNED_IN", mockSession));
      return {
        data: { user: mockSession.user, session: mockSession },
        error: null as Error | null,
      };
    },
    async signUp({
      email,
      password,
      options,
    }: {
      email: string;
      password?: string;
      options?: any;
    }) {
      const mockSession = {
        access_token: "mock-access-token",
        user: {
          id: "mock-user-id",
          email: email,
          user_metadata: options?.data || { full_name: "Demo User" },
        },
      };
      setMockSession(mockSession);
      const name = options?.data?.full_name || "Demo User";
      const phone = options?.data?.phone || "+91 99999 99999";
      setMockProfile({
        id: "mock-user-id",
        email,
        full_name: name,
        phone,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      authCallbacks.forEach((cb) => cb("SIGNED_IN", mockSession));
      return {
        data: { user: mockSession.user, session: mockSession },
        error: null as Error | null,
      };
    },
    async signInWithOAuth({ provider, options }: { provider: string; options?: any }) {
      const mockSession = {
        access_token: "mock-access-token",
        user: {
          id: "mock-user-id",
          email: "demo@vedaglows.com",
          user_metadata: { full_name: "Demo User" },
        },
      };
      setMockSession(mockSession);
      authCallbacks.forEach((cb) => cb("SIGNED_IN", mockSession));
      return {
        data: { user: mockSession.user, session: mockSession },
        error: null as Error | null,
      };
    },
    async signOut() {
      setMockSession(null);
      authCallbacks.forEach((cb) => cb("SIGNED_OUT", null));
      return { error: null as Error | null };
    },
    async resetPasswordForEmail(email: string, options?: any) {
      return { data: {}, error: null as Error | null };
    },
  },

  from(table: string) {
    const builder = {
      // Chainable modifiers
      select(columns?: string, options?: any) {
        return builder;
      },
      insert(payload: any) {
        const items = Array.isArray(payload) ? payload : [payload];
        let inserted: any[] = [];
        if (table === "orders") {
          const orders = [...getMockOrders()];
          items.forEach((item) => {
            const num = orders.length + 1005;
            const order_number = `VG-${num}`;
            const newOrder = {
              id: item.id || `o-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              order_number: item.order_number || order_number,
              user_id: item.user_id || "mock-user-id",
              customer_name: item.customer_name || "Demo User",
              customer_email: item.customer_email || "demo@vedaglows.com",
              customer_phone: item.customer_phone || "+91 99999 99999",
              shipping_address: item.shipping_address || {},
              subtotal: Number(item.subtotal) || 0,
              discount: Number(item.discount) || 0,
              shipping: Number(item.shipping) || 0,
              total: Number(item.total) || 0,
              coupon_id: item.coupon_id || null,
              coupon_code: item.coupon_code || null,
              payment_method: item.payment_method || "cod",
              payment_status: item.payment_status || "pending",
              status: item.status || "pending",
              notes: item.notes || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              order_items: item.order_items || [],
            };
            orders.unshift(newOrder);
            inserted.push(newOrder);
          });
          setMockOrders(orders);
        } else if (table === "coupons") {
          const coupons = [...getMockCoupons()];
          items.forEach((item) => {
            const newCoupon = {
              id: item.id || `c-${Date.now()}`,
              code: item.code.toUpperCase(),
              discount_type: item.discount_type,
              discount_value: Number(item.discount_value),
              max_uses: item.max_uses ?? null,
              used_count: 0,
              active: item.active !== false,
              expires_at: item.expires_at || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            coupons.push(newCoupon);
            inserted.push(newCoupon);
          });
          setMockCoupons(coupons);
        } else if (table === "product_overrides") {
          const overrides = [...getMockProductOverrides()];
          items.forEach((item) => {
            const idx = overrides.findIndex((o: any) => o.sku === item.sku);
            if (idx >= 0) {
              Object.assign(overrides[idx], item, { updated_at: new Date().toISOString() });
            } else {
              overrides.push({
                ...item,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });
            }
          });
          setMockProductOverrides(overrides);
          inserted = items;
        }
        builder._insertedRecord = inserted.length > 1 ? inserted : inserted[0];
        return builder;
      },
      update(payload: any) {
        if (table === "profiles") {
          const profile = { ...getMockProfile() };
          Object.assign(profile, payload, { updated_at: new Date().toISOString() });
          setMockProfile(profile);
        } else if (table === "orders") {
          builder._updatePayload = payload;
        } else if (table === "coupons") {
          builder._updatePayload = payload;
        } else if (table === "store_settings") {
          builder._updatePayload = payload;
        }
        return builder;
      },
      upsert(payload: any) {
        return builder.insert(payload);
      },
      delete() {
        if (table === "coupons") {
          builder._isDelete = true;
        }
        return builder;
      },
      eq(col: string, val: any) {
        builder._filters = builder._filters || [];
        builder._filters.push({ col, val });
        return builder;
      },
      order(col: string, options?: any) {
        return builder;
      },
      limit(count: number) {
        return builder;
      },
      single() {
        builder._single = true;
        return builder;
      },
      maybeSingle() {
        builder._maybeSingle = true;
        return builder;
      },

      // Internal storage for execution
      _insertedRecord: null as any,
      _filters: [] as Array<{ col: string; val: any }>,
      _updatePayload: null as any,
      _isDelete: false,
      _single: false,
      _maybeSingle: false,

      // Await/Promise execution
      then(resolve: (value: any) => void) {
        let resData: any = null;
        const resError: any = null;

        if (builder._insertedRecord) {
          resData = builder._insertedRecord;
        } else if (table === "user_roles") {
          // If we have any session, treat as admin
          const session = getMockSession();
          if (session) {
            resData = { role: "admin" };
          } else {
            resData = null;
          }
        } else if (table === "profiles") {
          resData = getMockProfile();
        } else if (table === "coupons") {
          const coupons = [...getMockCoupons()];
          const codeFilter = builder._filters.find((f) => f.col === "code");
          const idFilter = builder._filters.find((f) => f.col === "id");

          if (builder._updatePayload) {
            // Update coupon
            const id = idFilter?.val;
            const idx = coupons.findIndex((c: any) => c.id === id);
            if (idx >= 0) {
              Object.assign(coupons[idx], builder._updatePayload, {
                updated_at: new Date().toISOString(),
              });
              setMockCoupons(coupons);
              resData = coupons[idx];
            } else {
              // Insert instead
              const newCoupon = {
                id: `c-${Date.now()}`,
                code: builder._updatePayload.code,
                discount_type: builder._updatePayload.discount_type,
                discount_value: builder._updatePayload.discount_value,
                max_uses: builder._updatePayload.max_uses,
                used_count: 0,
                active: builder._updatePayload.active,
                expires_at: builder._updatePayload.expires_at,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              coupons.push(newCoupon);
              setMockCoupons(coupons);
              resData = newCoupon;
            }
          } else if (builder._isDelete) {
            const id = idFilter?.val;
            const filtered = coupons.filter((c: any) => c.id !== id);
            setMockCoupons(filtered);
            resData = { ok: true };
          } else if (codeFilter) {
            resData = coupons.find((c: any) => c.code === codeFilter.val) || null;
          } else if (idFilter) {
            resData = coupons.find((c: any) => c.id === idFilter.val) || null;
          } else {
            resData = coupons;
          }
        } else if (table === "orders") {
          const orders = [...getMockOrders()];
          const idFilter = builder._filters.find((f) => f.col === "id");
          const userFilter = builder._filters.find((f) => f.col === "user_id");

          if (builder._updatePayload) {
            const id = idFilter?.val;
            const idx = orders.findIndex((o: any) => o.id === id);
            if (idx >= 0) {
              Object.assign(orders[idx], builder._updatePayload, {
                updated_at: new Date().toISOString(),
              });
              setMockOrders(orders);
              resData = orders[idx];
            }
          } else if (idFilter) {
            resData = orders.find((o: any) => o.id === idFilter.val) || null;
          } else if (userFilter) {
            resData = orders.filter((o: any) => o.user_id === userFilter.val);
          } else {
            resData = orders;
          }
        } else if (table === "popup_settings") {
          const idFilter = builder._filters.find((f) => f.col === "id");
          if (builder._updatePayload) {
            setLocalStorage("vedaglows-popup-settings", builder._updatePayload.config);
            resData = { id: "singleton", config: builder._updatePayload.config };
          } else {
            const config = getLocalStorage("vedaglows-popup-settings", {});
            resData = { id: "singleton", config };
          }
        } else if (table === "store_settings") {
          const settings = { ...getMockStoreSettings() };
          if (builder._updatePayload) {
            Object.assign(settings, builder._updatePayload);
            setMockStoreSettings(settings);
          }
          resData = settings;
        } else if (table === "product_overrides") {
          resData = getMockProductOverrides();
        } else {
          resData = [];
        }

        // If single or maybeSingle is flagged and resData is an array, take the first element (or null if empty)
        if ((builder._single || builder._maybeSingle) && Array.isArray(resData)) {
          resData = resData.length > 0 ? resData[0] : null;
        }

        return resolve({
          data: resData,
          error: resError,
          count: Array.isArray(resData) ? resData.length : resData ? 1 : 0,
        });
      },
    };
    return builder;
  },
};

// Export as default supabase client
export const supabase = mockSupabaseClient;
export type { User } from "@supabase/supabase-js";
export type { Database } from "./types";
