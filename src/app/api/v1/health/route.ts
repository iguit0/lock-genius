import { NextRequest, NextResponse } from 'next/server'
import packageJson from '../../../../../package.json'

export async function GET(request: NextRequest) {
    try {
        const response = {
            pong: true,
            version: packageJson.version,
        }

        return NextResponse.json(response, {
            status: 200,
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
        })
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
