type CheckoutRequest = {
  tableId: string;
  amountInr: number;
  attendeeName: string;
};

function isCheckoutRequest(body: unknown): body is CheckoutRequest {
  return (
    typeof body === "object" &&
    body !== null &&
    "tableId" in body &&
    typeof body.tableId === "string" &&
    "amountInr" in body &&
    typeof body.amountInr === "number" &&
    "attendeeName" in body &&
    typeof body.attendeeName === "string"
  );
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  if (
    !isCheckoutRequest(body) ||
    !body.tableId.trim() ||
    !body.attendeeName.trim() ||
    !Number.isFinite(body.amountInr) ||
    body.amountInr <= 0 ||
    !Number.isSafeInteger(body.amountInr * 100)
  ) {
    return Response.json({ error: "Invalid checkout request" }, { status: 400 });
  }

  const amount = body.amountInr * 100;
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return Response.json({
      mode: "demo_upi",
      orderId: `order_demo_${Date.now()}`,
      amount,
      currency: "INR",
    });
  }

  const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount,
      currency: "INR",
      receipt: `fp_${body.tableId.slice(0, 8)}_${Date.now()}`,
    }),
  });

  if (!razorpayResponse.ok) {
    return Response.json(
      { error: "Failed to create Razorpay order" },
      { status: 502 },
    );
  }

  const order = await razorpayResponse.json();
  return Response.json({ ...order, keyId });
}
