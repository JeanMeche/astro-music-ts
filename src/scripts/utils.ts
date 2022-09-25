import { NavigateEvent, NavigationEvent } from './navigation';

export function getNavigationType(fromPath: string, toPath: string): string {
  if (fromPath === '/' && toPath.startsWith('/products')) {
    return 'home-to-product';
  }

  if (fromPath.startsWith('/products') && toPath === '/') {
    return 'product-to-home';
  }

  return 'other';
}

export function isBackNavigation(navigateEvent: NavigationEvent): boolean {
  if (
    navigateEvent.navigationType === 'push' ||
    navigateEvent.navigationType === 'replace' ||
    !navigation.currentEntry
  ) {
    return false;
  }

  if (navigateEvent.destination.index !== -1 && navigateEvent.destination.index < navigation.currentEntry.index) {
    return true;
  }

  return false;
}

export function shouldNotIntercept(navigateEvent: NavigateEvent): boolean {
  return (
    navigateEvent.canIntercept === false ||
    // If this is just a hashChange,
    // just let the browser handle scrolling to the content.
    navigateEvent.hashChange ||
    // If this is a download,
    // let the browser perform the download.
    !!navigateEvent.downloadRequest ||
    // If this is a form submission,
    // let that go to the server.
    !!navigateEvent.formData
  );
}

export function getLink(href: string): HTMLAnchorElement {
  const fullLink = new URL(href, location.href).href;

  const link = [...document.querySelectorAll('a')].find((link) => link.href === fullLink);
  if (!link) {
    throw new Error('Link not found');
  }
  return link;
}

export function getPathId(path: string): string {
  return path.split('/')[2];
}

export function updateTheDOMSomehow(data: string): void {
  document.getElementById('content')!.innerHTML = data;
}

export async function wait(timeout: number): Promise<unknown> {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), timeout);
  });
}
