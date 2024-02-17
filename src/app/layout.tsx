import { hasLastPrinterSettings } from '../server/helpers/printer-settings';
import { Redirecter } from './_hooks/navigation';
import { twJoin } from 'tailwind-merge';
import { inter } from './fonts';
import './../styles/globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html
			className={twJoin(
				'dark h-full scroll-smooth scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-400 scrollbar-thumb-rounded-md dark:scrollbar-thumb-zinc-600',
				inter.variable,
				inter.className,
			)}
		>
			<body className="h-full bg-zinc-100 dark:bg-[rgb(18,18,20)]">
				<Redirecter hasLastPrinterSettings={hasLastPrinterSettings()}>{children}</Redirecter>
			</body>
		</html>
	);
}
