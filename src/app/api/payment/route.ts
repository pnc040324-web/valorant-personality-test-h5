import { NextRequest, NextResponse } from "next/server";
/** 真实支付必须在服务端校验签名和回调；未配置渠道时明确返回 503。 */
export async function POST(request:NextRequest) { const body=await request.json(); if(!["wechat","alipay","stripe"].includes(body.channel)) return NextResponse.json({error:"不支持的支付方式"},{status:400}); return NextResponse.json({error:"支付渠道尚未配置"},{status:503}); }
