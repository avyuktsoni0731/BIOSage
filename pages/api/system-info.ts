import type { NextApiRequest, NextApiResponse } from 'next'
import si from 'systeminformation'

function snapToStandardRAMSize(sizeGB: number): string {
  const commonSizes = [4, 8, 16, 32, 64, 128];
  const closest = commonSizes.reduce((prev, curr) =>
    Math.abs(curr - sizeGB) < Math.abs(prev - sizeGB) ? curr : prev
  );
  return `${closest}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const [bios, cpu, mem, disk, graphics] = await Promise.all([
      si.bios(),
      si.cpu(),
      si.mem(),
      si.diskLayout(),
      si.graphics(),
    ])

    res.status(200).json({
      biosVersion: `${bios.version} (${bios.releaseDate})`,
      cpu: `${cpu.manufacturer} ${cpu.brand}`,
      memory: `${snapToStandardRAMSize(mem.total / (1024 ** 3))}GB`,
      storage: `${(disk[0].size / 1e12).toFixed(1)}TB ${disk[0].type}`,
      bootMode: 'UEFI',
      graphics: `${graphics.controllers[0].model}`,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch system info' })
  }
}