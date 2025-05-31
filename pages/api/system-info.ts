import type { NextApiRequest, NextApiResponse } from 'next'
import si from 'systeminformation'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const [bios, cpu, mem, disk] = await Promise.all([
      si.bios(),
      si.cpu(),
      si.mem(),
      si.diskLayout(),
    ])

    res.status(200).json({
      biosVersion: `${bios.version} (${bios.releaseDate})`,
      cpu: `${cpu.manufacturer} ${cpu.brand}`,
      memory: `${(mem.total / 1e9).toFixed(0)}GB`,
      storage: `${(disk[0].size / 1e12).toFixed(1)}TB ${disk[0].type}`,
      bootMode: 'UEFI'
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch system info' })
  }
}