import { useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { UseInfiniteQueryResult } from '@tanstack/react-query';
import { ActivityIndicator, Pressable } from 'react-native';
import { isPath, SearchData, type ExplorerItem } from '@sd/client';
import Layout from '~/constants/Layout';
import { tw } from '~/lib/tailwind';
import { BrowseStackScreenProps } from '~/navigation/tabs/BrowseStack';
import { useExplorerStore } from '~/stores/explorerStore';
import { useActionsModalStore } from '~/stores/modalStore';

import ScreenContainer from '../layout/ScreenContainer';
import FileItem from './FileItem';
import FileRow from './FileRow';
import Menu from './menu/Menu';

type ExplorerProps = {
	tabHeight?: boolean;
	items: ExplorerItem[] | null;
	/** Function to fetch next page of items. */
	loadMore: () => void;
	query: UseInfiniteQueryResult<SearchData<ExplorerItem>>;
	count?: number;
};

const Explorer = (props: ExplorerProps) => {
	const navigation = useNavigation<BrowseStackScreenProps<'Location'>['navigation']>();

	const store = useExplorerStore();

	const { modalRef, setData } = useActionsModalStore();

	function handlePress(data: ExplorerItem) {
		if (isPath(data) && data.item.is_dir && data.item.location_id !== null) {
			navigation.push('Location', {
				id: data.item.location_id,
				path: `${data.item.materialized_path}${data.item.name}/`
			});
		} else {
			setData(data);
			modalRef.current?.present();
		}
	}

	return (
		<ScreenContainer tabHeight={props.tabHeight} scrollview={false} style={'gap-0 py-0'}>
			<Menu />
			{/* Items */}
			<FlashList
				key={store.layoutMode}
				numColumns={store.layoutMode === 'grid' ? store.gridNumColumns : 1}
				data={props.items ?? []}
				keyExtractor={(item) =>
					item.type === 'NonIndexedPath'
						? item.item.path
						: item.type === 'SpacedropPeer'
							? item.item.name
							: item.item.id.toString()
				}
				renderItem={({ item }) => (
					<Pressable onPress={() => handlePress(item)}>
						{store.layoutMode === 'grid' ? (
							<FileItem data={item} />
						) : (
							<FileRow data={item} />
						)}
					</Pressable>
				)}
				contentContainerStyle={tw`px-2 py-5`}
				extraData={store.layoutMode}
				estimatedItemSize={
					store.layoutMode === 'grid'
						? Layout.window.width / store.gridNumColumns
						: store.listItemSize
				}
				onEndReached={() => props.loadMore?.()}
				onEndReachedThreshold={0.6}
				ListFooterComponent={props.query.isFetchingNextPage ? <ActivityIndicator /> : null}
			/>
		</ScreenContainer>
	);
};

export default Explorer;
