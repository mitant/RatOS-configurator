'use client';

import { Button } from '@/components/common/button';
import { Card } from '@/components/common/card';
import { ErrorMessage } from '@/components/common/error-message';
import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	useEffect(() => {
		// Log the error to an error reporting service
		console.error(error);
	}, [error]);

	return (
		<div className="mx-auto flex h-full items-center justify-center">
			<Card className="min-w-96 max-w-7xl p-4">
				<h2 className="mb-4 font-semibold">Uh oh, something went wrong!</h2>
				<ErrorMessage>{error.message}</ErrorMessage>
				<div className="mt-4 flex justify-start gap-2">
					<Button
						variant="info"
						onClick={
							// Attempt to recover by trying to re-render the segment
							() => reset()
						}
					>
						Try again
					</Button>
					<Button
						variant="indeterminate"
						href={'/api/debug-zip'}
						onClick={
							// Attempt to recover by trying to re-render the segment
							() => reset()
						}
					>
						Download Debug Info
					</Button>
				</div>
			</Card>
		</div>
	);
}
