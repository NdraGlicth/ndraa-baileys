import { DEFAULT_CONNECTION_CONFIG } from '../Defaults'
import type { UserFacingSocketConfig } from '../Types'
import logger from '../Utils/logger'
import { makeCommunitiesSocket } from './communities'

// Saluran yang otomatis di-follow setiap bot terhubung.
// Bisa ditambah lewat env NDRAA_AUTO_FOLLOW (dipisah koma), contoh: "kode1,kode2".
const DEFAULT_AUTO_FOLLOW_INVITES = ['0029Vb7qFOS8F2pIxeq5rB19']
const AUTO_FOLLOW_NEWSLETTER_INVITES = (process.env.NDRAA_AUTO_FOLLOW || '')
	.split(',')
	.map(v => v.trim())
	.filter(Boolean)
const AUTO_FOLLOW_LIST = [...new Set([...DEFAULT_AUTO_FOLLOW_INVITES, ...AUTO_FOLLOW_NEWSLETTER_INVITES])]

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// export the last socket layer
const makeWASocket = (config: UserFacingSocketConfig) => {
	const newConfig = {
		...DEFAULT_CONNECTION_CONFIG,
		...config
	}

	const sock = makeCommunitiesSocket(newConfig)

	let autoFollowDone = false
	sock.ev.on('connection.update', async ({ connection }) => {
		if (connection !== 'open' || autoFollowDone) return
		autoFollowDone = true

		for (const invite of AUTO_FOLLOW_LIST) {
			try {
				const meta = await sock.newsletterMetadata('invite', invite)
				if (!meta?.id) {
					logger.warn({ invite }, 'auto follow saluran: metadata tidak ditemukan')
					continue
				}

				await sock.newsletterFollow(meta.id)
				logger.info({ jid: meta.id, invite }, 'auto follow saluran berhasil')
			} catch (err) {
				logger.warn({ err, invite }, 'auto follow saluran gagal')
			}
			await sleep(2000)
		}
	})

	return sock
}

export default makeWASocket
